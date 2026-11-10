import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../TopNavBarComponent.css";

function getCookie(name) {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith(`${name}=`))?.split("=")[1] || "";
}

function instructorRole(user) {
  return user?.role?.toLowerCase() === "instructor" ||
    user?.is_instructor === true ||
    user?.groups?.some((group) =>
      (typeof group === "string" ? group : group?.name)?.toLowerCase() === "instructor"
    );
}

export default function TopNavBarComponent() {
  const location = useLocation();
  const basePath = location.pathname.startsWith("/static/frontend") ? "/static/frontend" : "";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const refreshUser = () => {
      fetch("/api/user/info/", { signal: controller.signal, credentials: "same-origin" })
        .then((response) => {
          if (response.status === 401) return null;
          if (!response.ok) throw new Error(`Unable to fetch user info (${response.status})`);
          return response.json();
        })
        .then(setUser)
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
            setUser(null);
          }
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    };
    refreshUser();
    window.addEventListener("blockbot:login", refreshUser);
    return () => {
      controller.abort();
      window.removeEventListener("blockbot:login", refreshUser);
    };
  }, []);

  async function handleLogout() {
    setError("");
    try {
      const response = await fetch("/api/user/logout/", {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      if (!response.ok) throw new Error("Unable to log out. Please try again.");
      setUser(null);
      window.location.assign("/");
    } catch (err) {
      setError(err.message || "Logout failed.");
    }
  }

  // Avoid briefly rendering a student/guest navigation bar while the role loads.
  if (loading) return null;

  if (instructorRole(user)) {
    const linkClass = ({ isActive }) => `bb-inav-link${isActive ? " bb-inav-active" : ""}`;
    return (
      <header className="bb-inav-header">
        <nav className="bb-inav" aria-label="Instructor navigation">
          <Link className="bb-inav-brand" to={`${basePath}/home`} aria-label="BlockBot Studio dashboard">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="BlockBot Studio" />
          </Link>
          <div className="bb-inav-links">
            <NavLink to={`${basePath}/home`} end className={linkClass}>Dashboard</NavLink>
            <span className="bb-inav-disabled" aria-disabled="true" title="Learning library coming later">Learn</span>
            <span className="bb-inav-disabled" aria-disabled="true" title="Projects page coming later">Projects</span>
            <NavLink to={`${basePath}/editor`} className={linkClass}>Editor</NavLink>
            <span className="bb-inav-disabled" aria-disabled="true" title="Classroom page coming later">Classroom</span>
            <span className="bb-inav-disabled" aria-disabled="true" title="Help page coming later">Help</span>
          </div>
          <div className="bb-inav-account">
            <img src={`${import.meta.env.BASE_URL}images/profile-silhouette.svg`} alt="" />
            <span className="bb-inav-name">{user?.first_name || user?.display_name || "Instructor"}</span>
            <button type="button" className="bb-inav-logout" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
        {error && <div className="bb-inav-error" role="alert">{error}</div>}
      </header>
    );
  }

  // Preserve the existing navigation for students and guests for now.
  return (
    <nav className="site-nav bg-gray-200 text-black flex items-center gap-4 shadow-md">
      <Link to={`${basePath}/home`} className="logo">
        <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="BlockBot Studio" className="h-auto w-54 mr-1" />
      </Link>
      <div className="nav-links flex gap-1 text-2xl">
        <Link to={`${basePath}/home`} className="mr-4 hover:text-blue-600">Home</Link>
        <Link to={`${basePath}/editor`} className="mr-4 hover:text-gray-400">Editor</Link>
        {user ? <button type="button" onClick={handleLogout} className="hover:text-gray-400">Logout</button>
          : <Link to={`${basePath}/login`} className="hover:text-gray-400">Login</Link>}
      </div>
      {error && <span role="alert">{error}</span>}
    </nav>
  );
}