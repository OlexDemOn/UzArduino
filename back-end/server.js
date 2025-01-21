const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("portions.db");
const { WebSocketServer } = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

const { SerialPort, ReadlineParser } = require("serialport");

let currentPort = null; // Active serial port connection
let parser = null;

// Endpoint: List accessible ports
app.get("/ports", async (req, res) => {
    try {
        const ports = await SerialPort.list();
        const portNames = ports.map((port) => port.path);
        res.json({ ports: portNames });
    } catch (error) {
        res.status(500).json({
            error: "Failed to list ports",
            details: error.message,
        });
    }
});

// Endpoint: Set connection to chosen port
app.post("/connect", async (req, res) => {
    const { portName, baudRate = 9600 } = req.body;

    if (currentPort) {
        currentPort.close((err) => {
            if (err) console.error("Error closing previous port:", err.message);
        });
    }

    try {
        currentPort = new SerialPort({ path: portName, baudRate });
        parser = currentPort.pipe(new ReadlineParser({ delimiter: "\n" }));

        currentPort.on("open", () => {
            console.log(`Connected to port: ${portName}`);
            res.json({ message: `Connected to port: ${portName}` });
        });

        currentPort.on("error", (err) => {
            console.error("Serial port error:", err.message);
            res.status(500).json({
                error: "Serial port error",
                details: err.message,
            });
        });

        parser.on("data", (data) => {
            console.log("Received from Arduino: test", data.trim());
            // const { date, time, portions };
            if (isNumeric(data.trim())) {
                const date = new Date().toLocaleDateString().toString();
                const time = new Date().toLocaleTimeString().toString();
                const portions = parseInt(data.trim()) / 30;

                if (!date || !time || !portions) {
                    return res.status(400).json({
                        error: "Invalid data. Provide date, time, and portions.",
                    });
                }

                const query = `INSERT INTO portions (date, time, portions) VALUES (?, ?, ?)`;
                db.run(query, [date, time, portions], function (err) {
                    if (err) {
                        +-console.error("Failed to save data:", err.message);
                        throw new Error("Failed to save data");
                    }

                    const newEntry = { id: this.lastID, date, time, portions };
                    broadcast({ event: "new-portion", data: newEntry }); // Notify all WebSocket clients
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to connect to port",
            details: error.message,
        });
    }
});

// Endpoint: Send interval
app.post("/interval", (req, res) => {
    const { interval, angle } = req.body;

    if (!currentPort || angle % 30 !== 0 || angle <= 0 || angle > 360) {
        return res.status(400).json({
            error: "Invalid angle. Must be a multiple of 30 and within 1 to 360.",
        });
    }

    if (!interval || interval <= 0) {
        return res
            .status(400)
            .json({ error: "Invalid interval or no active port connection" });
    }

    console.log(angle);
    const commandForAngle = `ANGLE=${angle}\n`;
    currentPort.write(commandForAngle, (err) => {
        if (err) {
            console.error("Error sending angle:", err.message);
            return res
                .status(500)
                .json({ error: "Failed to send angle", details: err.message });
        }
    });

    const commandForInterval = `INTERVAL=${interval}\n`;
    currentPort.write(commandForInterval, (err) => {
        if (err) {
            console.error("Error sending interval:", err.message);
            return res.status(500).json({
                error: "Failed to send interval",
                details: err.message,
            });
        }
        res.json({
            message: `Interval ${interval} sent successfully and Angle ${angle} sent successfully`,
        });
    });
});

// Endpoint: Disconnect from current port
app.post("/disconnect", (req, res) => {
    if (!currentPort) {
        return res.status(400).json({ error: "No active port to disconnect" });
    }

    currentPort.close((err) => {
        if (err) {
            console.error("Error disconnecting port:", err.message);
            return res.status(500).json({
                error: "Failed to disconnect port",
                details: err.message,
            });
        }

        currentPort = null;
        res.json({ message: "Disconnected from port successfully" });
    });
});

db.run(`
    CREATE TABLE IF NOT EXISTS portions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      portions INTEGER NOT NULL
    )
  `);

const wss = new WebSocketServer({ port: 8080 });
let clients = [];

function broadcast(data) {
    clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.push(ws);

    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter((client) => client !== ws);
    });
});

app.post("/save-portions", (req, res) => {
    const { date, time, portions } = req.body;

    if (!date || !time || !portions) {
        return res
            .status(400)
            .json({ error: "Invalid data. Provide date, time, and portions." });
    }

    const query = `INSERT INTO portions (date, time, portions) VALUES (?, ?, ?)`;
    db.run(query, [date, time, portions], function (err) {
        if (err) {
            console.error("Failed to save data:", err.message);
            return res
                .status(500)
                .json({ error: "Failed to save data", details: err.message });
        }

        const newEntry = { id: this.lastID, date, time, portions };
        broadcast({ event: "new-portion", data: newEntry }); // Notify all WebSocket clients
        res.json({ message: "Portions saved successfully", id: this.lastID });
    });
});

// Endpoint: Fetch all portion data
app.get("/get-portions", (req, res) => {
    const query = `SELECT * FROM portions ORDER BY time DESC `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Failed to fetch data:", err.message);
            return res
                .status(500)
                .json({ error: "Failed to fetch data", details: err.message });
        }
        res.json(rows);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}
