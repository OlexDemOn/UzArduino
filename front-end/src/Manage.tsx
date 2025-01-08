import { Button } from "./components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/select";

function ManagePanel() {
    const connection: boolean = true;

    const toggleLED = (state) => {
        fetch("http://localhost:3000/led", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ state }),
        })
            .then((response) => response.text())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    return (
        <div className="relative">
            <div className="w-full sticky top-5 left-0 flex flex-col gap-4 p-4 bg-background rounded-md shadow-md">
                <span
                    className={connection ? "text-green-500" : "text-red-500"}
                >
                    {connection ? "Connected" : "No connection"}
                </span>
                <span>Choose how often to feed</span>
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Every 6 hours" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="6">Every 6 hours</SelectItem>
                        <SelectItem value="12">Every 12 hours</SelectItem>
                        <SelectItem value="18">Every 18 hours</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="w-fit">Update</Button>
                <Button className="w-fit" onClick={() => toggleLED("on")}>
                    Turn On
                </Button>
                <Button className="w-fit" onClick={() => toggleLED("off")}>
                    Turn Off
                </Button>
            </div>
        </div>
    );
}

export default ManagePanel;
