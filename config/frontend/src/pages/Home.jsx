import { useEffect, useState } from 'react';
import StudentDashboard from './Student/StudentDashboard';
import InstructorDashboard from './Instructor/InstructorDashboard';

function Home() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    if (loading) return <p>Loading dashboard...</p>;
    if (!user) return <p>Please log in to access your dashboard.</p>;

    const isInstructor = user.role === 'instructor' || user.is_instructor === true ||
        user.groups?.some((group) => (typeof group === 'string' ? group : group.name)?.toLowerCase() === 'instructor');
    return isInstructor ? <InstructorDashboard user={user} /> : <StudentDashboard user={user} />;
}

export default Home;