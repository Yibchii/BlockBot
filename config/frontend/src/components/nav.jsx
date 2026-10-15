import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
    const location = useLocation();
    const basePath = location.pathname.startsWith("/static/frontend") ? "/static/frontend" : "";

    return (
        <nav className="site-nav bg-gray-800 text-white p-3">
            <Link to={`${basePath}/home`} className="mr-4 hover:text-gray-400">
                Home
            </Link>
            <Link to={`${basePath}/editor`} className="mr-4 hover:text-gray-400">
                Editor
            </Link>
            <Link to={`${basePath}/login`} className="hover:text-gray-400">
                Login
            </Link>
        </nav>
    );
}
