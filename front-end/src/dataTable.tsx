import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./components/ui/table";
import data from "./TEMPORARY/temp_data.json";

function PrevData() {
    // console.log(data);
    return (
        <div>
            <h1 className="text-center font-bold text-xl">Previous feeding</h1>
            <Table>
                <TableCaption>A list of your last feeding.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((el) => (
                        <TableRow key={el.id}>
                            <TableCell className="font-medium">
                                {el.date}
                            </TableCell>
                            <TableCell>{el.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default PrevData;
