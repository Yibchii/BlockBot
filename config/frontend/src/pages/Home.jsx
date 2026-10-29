import StudentDashboard from '../pages/StudentDashboard';
import InstructorDashboard from '../pages/InstructorDashboard';

function Home() {

    return (
        <div>
            <StudentDashboard user={{first_name: "John"}} />
            
        </div>
    );
}

export default Home;