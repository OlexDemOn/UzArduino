const express = require("express");
const cors = require("cors");
const SerialPort = require("serialport").SerialPort;

const app = express();
const port = 3000;

// Replace with your Arduino's COM port
const arduinoPort = new SerialPort({
    path: "COM3", // Adjust this to match your Arduino's port
    baudRate: 9600,
});

// Middleware
app.use(cors()); // Allow requests from React
app.use(express.json()); // Parse JSON request bodies

// Endpoint to send commands to Arduino
app.post("/led", (req, res) => {
    const { state } = req.body; // Read the 'state' value from the request body

    if (state === "on") {
        arduinoPort.write("1", (err) => {
            if (err) {
                console.error("Error sending ON command:", err);
                return res.status(500).send("Failed to send ON command.");
            }
            res.send("LED turned ON.");
        });
    } else if (state === "off") {
        arduinoPort.write("0", (err) => {
            if (err) {
                console.error("Error sending OFF command:", err);
                return res.status(500).send("Failed to send OFF command.");
            }
            res.send("LED turned OFF.");
        });
    } else {
        res.status(400).send("Invalid state. Use 'on' or 'off'.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
