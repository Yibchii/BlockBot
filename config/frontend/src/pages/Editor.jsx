import { useEffect, useState } from "react";
import BlocklyComponent from "../components/BlocklyComponent";
import MazeBot2DComponent from "../components/MazeBot2DComponent";

export default function Editor() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/test/")
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error("Error:", error));
    }, []);

    return (
        <div>
            <h1 className="text-4xl lg:text-6xl">BlockBot</h1>
            <p>{message}</p>
            <div className="flex flex-row gap-8 items-start" >
                <div>
                    <BlocklyComponent />
                </div>
                <div>
                    <MazeBot2DComponent />
                </div>
            </div>
        </div>
    );
}
