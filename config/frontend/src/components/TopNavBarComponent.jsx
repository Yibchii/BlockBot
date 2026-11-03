import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.split("=")[1];
}

export default function TopNavBarComponent() {
    const location = useLocation();
    const basePath = location.pathname.startsWith("/static/frontend") ? "/static/frontend" : "";
    const [user, setUser] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const refreshUser = () => fetch("/api/user/info/", { signal: controller.signal })
            .then((response) => {
                if (response.status === 401) {
                    return null;
                }
                if (!response.ok) {
                    throw new Error(`Unable to fetch user info (${response.status})`);
                }
                return response.json();
            })
            .then(setUser)
            .catch((error) => {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setUser(null);
                }
            });

        refreshUser();
        window.addEventListener("blockbot:login", refreshUser);

        return () => {
            controller.abort();
            window.removeEventListener("blockbot:login", refreshUser);
        };
    }, []);

    const handleLogout = () => {
        fetch("/api/user/logout/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to log out (${response.status})`);
                }
                setUser(null);
                window.location.assign("/");
            })
            .catch((error) => console.error(error));
    };

    return (
        <nav className="site-nav bg-gray-800 text-white p-1 flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="logo">   
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Blockbot Logo" className="h-auto w-54 mr-1" />
            </a>

            {/* Navigation links */}
            <div className="nav-links flex gap-1"> 
                <Link to={`${basePath}/home`} className="mr-4 hover:text-gray-400">
                    Home
                </Link>
                <Link to={`${basePath}/editor`} className="mr-4 hover:text-gray-400">
                    Editor
                </Link>
                {user ? (
                    <button type="button" onClick={handleLogout} className="hover:text-gray-400">
                        Logout
                    </button>
                ) : (
                    <Link to={`${basePath}/login`} className="hover:text-gray-400">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
