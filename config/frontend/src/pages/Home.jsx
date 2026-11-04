import { useEffect, useState } from 'react';
import StudentDashboard from '../components/StudentDashboard';

function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/user/info/', { signal: controller.signal })
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
                if (error.name !== 'AbortError') {
                    console.error(error);
                    setUser(null);
                }
            });

        return () => controller.abort();
    }, []);

    return (
        <div >
            {user ? (
                <StudentDashboard user={user} />
            ) : (
                <p>Loading dashboard...</p>
            )}
        </div>
    );
}

export default Home;