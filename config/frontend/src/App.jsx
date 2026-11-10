import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import TopNavBarComponent from "./components/Instructor/TopNavBarComponent.instructor";
import LoginPage from "./pages/Login/LoginPage";
import Editor from "./pages/Student/StudentBlockProgram";

function AppContent() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/static/frontend/login";

  return (
    <>
      {!hideNavbar && <TopNavBarComponent />}
      <main className="mx-auto w-full"> { /* Contains all content besides nav bar (and footer once added) */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/static/frontend/editor" element={<Editor />} />
          <Route path="/static/frontend/home" element={<Home />} />
          <Route path="/static/frontend/login" element={<LoginPage />} />
          <Route path="/static/frontend/*" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default App;
