import { useEffect, useState } from "react";
import "./App.css";
import BlocklyComponent from "./BlocklyComponent";

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
      <BlocklyComponent />
    </div>
  );
}

export default App;