import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import TopNavBarComponent from "./components/Instructor/TopNavBarComponent.instructor";
import LoginPage from "./pages/Login/LoginPage";
import Editor from "./pages/Student/StudentBlockProgram";
import MyProjects from "./pages/Student/Projects/MyProjects";
import { useEffect } from "react";
import AccessibilitySettings, {
  applyAccessibilitySettings,
  readAccessibilitySettings,
} from "./pages/AccessibilitySettings";
import Classroom from "./pages/Classroom/Classroom";

function AppContent() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/static/frontend/login";

  return (
    <>
      {!hideNavbar && <TopNavBarComponent />}
      <main className="mx-auto w-full">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/static/frontend/editor" element={<Editor />} />
          <Route path="/static/frontend/projects" element={<MyProjects />} />
          <Route path="/static/frontend/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/static/frontend/login" element={<LoginPage />} />
          <Route path="/settings" element={<AccessibilitySettings />} />
          <Route path="/static/frontend/settings" element={<AccessibilitySettings />} />
          <Route path="/static/frontend/*" element={<Home />} />
          <Route path="/editor" element={<Editor />} />

          <Route path="/home" element={<Home />} />
          <Route path="/static/frontend/home" element={<Home />} />

          <Route path="/editor" element={<Editor />} />
          <Route path="/static/frontend/editor" element={<Editor />} />

          <Route path="/classroom" element={<Classroom />} />
          <Route path="/static/frontend/classroom" element={<Classroom />} />

          <Route path="/static/frontend/*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
    useEffect(() => {
    applyAccessibilitySettings(readAccessibilitySettings());
  }, []);
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}