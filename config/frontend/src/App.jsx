import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./components/nav";
import LoginPage from "./pages/LoginPage";
import Editor from "./pages/StudentBlockProgram";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="mx-auto w-full"> { /* Contains all content besides nav bar (and footer once added) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/static/frontend/editor" element={<Editor />} />
          <Route path="/static/frontend/home" element={<Home />} />
          <Route path="/static/frontend/login" element={<LoginPage />} />
          <Route path="/static/frontend/*" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}


export default App;