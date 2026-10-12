import { BrowserRouter, Route, Routes } from "react-router-dom";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import NavBar from "./components/nav";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="mx-auto"> { /* Contains all content besides nav bar (and footer once added) */}
        <Routes>
          { /* To add new pages, create a new component, add a path to BlockBot/urls.py, then add a route here */}
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