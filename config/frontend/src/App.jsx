import { BrowserRouter, Route, Routes } from "react-router-dom";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import NavBar from "./components/nav";
import LoginPage from "./pages/LoginPage";
import StudentWorkspace from "./pages/Student_Block_Program";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="mx-auto"> { /* Contains all content besides nav bar (and footer once added) */}
        <Routes>
          { /* To add new pages, create a new component, add a path to BlockBot/urls.py, then add a route here */}
          <Route path="/" element={<StudentWorkspace />} />
          <Route path="/editor" element={<StudentWorkspace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student" element={<StudentWorkspace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}


export default App;