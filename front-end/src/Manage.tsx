import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/select";
import axios from "axios";

function ManagePanel() {
    const [connected, setConnected]: boolean = useState(false);
    const [connections, setConnections] = useState([]);
    let interval: number = 0.001,
        portion: number = 1;
    useEffect(() => {
        axios
            .get("http://localhost:3000/ports")
            .then((data) => setConnections(data.data.ports));
    }, []);

    useEffect(() => {}, [connections]);

    const handleValueChange = (value: string) => {
        axios
            .post("http://localhost:3000/connect", {
                portName: value,
            })
            .then((data) => {
                if (data.status == 200) {
                    setConnected(true);
                }
            });
        console.log("Selected Value:", value);
    };

    const update = async () => {
        console.log(interval, portion);
        await axios
            .post("http://localhost:3000/interval", {
                interval: interval,
                angle: portion * 30,
            })
            .then((data) => {
                console.log(data);
            });
    };

    const date = new Date().toLocaleDateString().toString();
    const time = new Date().toLocaleTimeString().toString();

    console.log(date, time);

    return (
        <div className="relative">
            <div className="w-full sticky top-5 left-0 flex flex-col gap-4 p-4 bg-background rounded-md shadow-md">
                <span className={connected ? "text-green-500" : "text-red-500"}>
                    {connected ? "Connected" : "No connection"}
                </span>
                <Select onValueChange={handleValueChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose the com port" />
                    </SelectTrigger>
                    <SelectContent>
                        {connections.length > 0 &&
                            connections.map((el) => (
                                <SelectItem key={el} value={el}>
                                    {el}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
                <Select
                    onValueChange={(value) => (interval = parseFloat(value))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose how often to feed" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0.001">
                            Every 4 second (for test)
                        </SelectItem>
                        <SelectItem value="6">Every 6 hours</SelectItem>
                        <SelectItem value="12">Every 12 hours</SelectItem>
                        <SelectItem value="18">Every 18 hours</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    onValueChange={(value) => (portion = parseFloat(value))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Amount of portion" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="w-fit" onClick={update}>
                    Update
                </Button>
                {/* <Button className="w-fit" onClick={() => toggleLED("on")}>
                    Turn On
                </Button>
                <Button className="w-fit" onClick={() => toggleLED("off")}>
                    Turn Off
                </Button> */}
            </div>
        </div>
    );
}

export default ManagePanel;
