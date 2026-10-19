import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function NavBar() {
    const location = useLocation();
    const basePath = location.pathname.startsWith("/static/frontend") ? "/static/frontend" : "";

    return (
        <nav className="site-nav bg-gray-800 text-white p-1 flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="logo">   
                <img src={logo} alt="Blockbot Logo" className="h-auto w-54 mr-1" />
            </a>

            {/* Navigation links */}
            <div className="nav-links flex gap-1"> 
            <Link to={`${basePath}/home`} className="mr-4 hover:text-gray-400">
                Home
            </Link>
            <Link to={`${basePath}/editor`} className="mr-4 hover:text-gray-400">
                Editor
            </Link>
            <Link to={`${basePath}/login`} className="hover:text-gray-400">
                Login
            </Link>
            </div>
        </nav>
    );
}
