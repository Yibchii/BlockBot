import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test/")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>BlockBot</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;