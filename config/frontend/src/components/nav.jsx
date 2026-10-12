import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <nav className="bg-gray-800 text-white p-3">
            <Link to="/home" className="mr-4 hover:text-gray-400">
                Home
            </Link>
            <Link to="/editor" className="mr-4 hover:text-gray-400">
                Editor
            </Link>
            <Link to="/login" className="hover:text-gray-400">
                Login
            </Link>
        </nav>
    );
}

