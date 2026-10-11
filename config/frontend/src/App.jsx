import { useEffect, useState } from "react";
import "./App.css";
import BlocklyComponent from "./components/BlocklyComponent";
import MazeBot2DComponent from "./components/MazeBot2DComponent";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/test/")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>BlockBot</h1>
      <p>{message}</p>
      <div style={{ display: "flex", flexDirection: "row", gap: "2rem", alignItems: "flex-start" }}>
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

export default App;