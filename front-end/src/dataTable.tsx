import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./components/ui/table";

function PrevData() {
    const [data, setPortions] = useState([]);

    useEffect(() => {
        // Fetch initial data from the backend
        fetch("http://localhost:3000/get-portions")
            .then((response) => response.json())
            .then((data) => setPortions(data))
            .catch((error) =>
                console.error("Failed to fetch portion data:", error)
            );

        // Connect to WebSocket
        const ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => console.log("WebSocket connection established");
        ws.onmessage = (message) => {
            const { event, data } = JSON.parse(message.data);
            if (event === "new-portion") {
                // setPortions((prev) => [...prev, data]);
                setPortions((prev) => [data, ...prev]);
            }
        };
        ws.onclose = () => console.log("WebSocket connection closed");

        // Cleanup WebSocket on component unmount
        return () => ws.close();
    }, []);

    console.log(data);

    return (
        <div>
            <h1 className="text-center font-bold text-xl">Previous feeding</h1>
            <Table>
                <TableCaption>A list of your last feeding.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Portions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((el) => (
                        <TableRow key={el.id}>
                            <TableCell className="font-medium">
                                {el.date}
                            </TableCell>
                            <TableCell>{el.time}</TableCell>
                            <TableCell>{el.portions}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default PrevData;
