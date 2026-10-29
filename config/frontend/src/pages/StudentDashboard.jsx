import DashboardCard from '../components/DashboardCard';
import DashboardListItem from '../components/DashboardListItem';

function StudentDashboard({user}) {
    return (
        <div className="student-dashboard p-5">
            {/* Student Avatar Section */}
            <section className="avatar-section h-30 p-8 bg-gray-200 rounded-lg flex items-center gap-5">
                <img src={`${import.meta.env.BASE_URL}images/profile-silhouette.svg`} 
                     alt="Student Avatar" 
                     className="avatar w-20 h-20 rounded-full" 
                />
                <div className="welcome-banner">
                    <h1>
                        Welcome back, {user.first_name}!
                    </h1>
                    <p>
                        Keep learning and build something amazing with your robot!
                    </p>
                </div>
                <button className="ml-auto bg-blue-500 text-white p-2 w-35 rounded-lg"> + New Project 
                </button>
            </section>
        {/* Student Dashboard Cards */}
        <section className="continue-learning mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Continue Learning Card */}
            <DashboardCard src={`${import.meta.env.BASE_URL}images/RobotDancing.gif`} title="Continue Learning" content="Continue where you left off." progress={60} button={true} />

            {/* Recent Projects Card */}
            <div className="dashboard-card p-2 bg-gray-100 rounded-lg shadow-md gap-3">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold mb-1">Recent Projects</h1>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        + View All
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <DashboardListItem title="Maze Runner" description="Your latest project.">
                    </DashboardListItem>
                    <DashboardListItem title="Maze Runner" description="Your latest project." />
                    <DashboardListItem title="Maze Runner" description="Your latest project." />
                </div>  
            </div>
            
            <DashboardCard title="Available Challenges" content="You have 2 upcoming deadlines." />
        </section>
                
            
        </div>
        
    );
}

export default StudentDashboard;
