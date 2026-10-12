import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
    const location = useLocation();

    if (location.pathname === "/student") return null;

    return (
        <nav className="site-nav bg-gray-800 text-white p-3">
            <Link to="/home" className="mr-4 hover:text-gray-400">
                Home
            </Link>
            <Link to="/editor" className="mr-4 hover:text-gray-400">
                Editor
            </Link>
            <Link to="/student" className="mr-4 hover:text-gray-400">
                workspace
            </Link>
            <Link to="/login" className="hover:text-gray-400">
                Login
            </Link>
        </nav>
    );
}

