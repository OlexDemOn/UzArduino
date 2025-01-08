import { useEffect } from "react";
import ManagePanel from "./manage";
import PrevData from "./dataTable";

function App() {
    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);

    return (
        <div className="grid grid-cols-2 p-5">
            <ManagePanel />
            <PrevData />
        </div>
    );
}

export default App;
