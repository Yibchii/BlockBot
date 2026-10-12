import { BrowserRouter, Route, Routes } from "react-router-dom";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import NavBar from "./components/nav";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="mx-auto">
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}


export default App;