import { Link, useLocation } from "react-router-dom";

export default function TopNavBarComponent() {
    const location = useLocation();
    const basePath = location.pathname.startsWith("/static/frontend") ? "/static/frontend" : "";

    return (
        <nav className="site-nav bg-gray-200 text-black flex items-center gap-4 shadow-md">
            {/* Logo */}
            <a href="/" className="logo">   
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Blockbot Logo" className="h-auto w-54 mr-1" />
            </a>

            {/* Navigation links */}
            <div className="nav-links flex gap-1 text-2xl"> 
                <Link to={`${basePath}/home`} className="mr-4 hover:text-blue-600">
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
