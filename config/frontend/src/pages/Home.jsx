import StudentDashboard from '../components/StudentDashboard';
import InstructorDashboard from '../components/InstructorDashboard';

function Home() {

    return (
        <div >
            <StudentDashboard user={{first_name: "John"}} />
            
        </div>
    );
}

export default Home;