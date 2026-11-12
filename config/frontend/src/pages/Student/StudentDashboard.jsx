import DashboardCard from '../components/DashboardCard';
import DashboardListItem from '../components/DashboardListItem';
import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

function StudentDashboard({user}) {
    const [projects, setProjects] = useState([]);

    return (
        <div className="student-dashboard p-3">
            {/* Student Avatar Section */}
            <section className="avatar-section h-25 p-8 bg-gray-200 rounded-lg flex items-center gap-5">
                <img src={`${import.meta.env.BASE_URL}images/profile-silhouette.svg`} 
                    alt="Student Avatar" 
                    className="avatar bg-gray-400 w-20 h-20 rounded-full" 
                />
                <div className="welcome-banner">
                    <h1 className="m-1 text-3xl font-bold text-left">
                        Welcome back, {user.first_name}!
                    </h1>
                    <p>
                        Keep learning and build something amazing with your robot!
                    </p>
                </div>
                <button className="ml-auto bg-blue-700 text-white p-2 w-35 rounded-lg hover:bg-blue-800">
                    + New Project 
                </button>
            </section>
            
            {/* Student Continue Learning Dashboard Card */}
            <section className="continue-learning mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                
                {/* Continue Learning Card */}
                <DashboardCard src={`${import.meta.env.BASE_URL}images/RobotDancing.gif`} title="Continue Learning" content="Continue where you left off." progress={60} button={true} />

                {/* Recent Projects Card */}
                <div className="dashboard-card h-full p-4 bg-gray-100 rounded-lg shadow-md flex flex-col">
                    <DashboardCard
                        title="Recent Projects"
                        viewAll={true}
                        viewAllLink="/projects"
                    />
                    
                    {projects.length === 0 ? (
                        // No projects yet
                        <div className="flex flex-col items-center justify-center gap-3 flex-1 text-center">
                            <FolderOpen className="w-10 h-10 text-gray-400" />
                            <p className="text-xl font-bold text-black">No projects yet</p>
                            <p className="text-gray-500">
                                Get started by creating your first project.
                            </p>
                            <Link
                                to="/editor"
                                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                            >
                                + Create Project
                            </Link>
                        </div>
                    ) : (
                        // Projects exist
                        <div className="bg-gray-200 space-y-3">
                            {projects.slice(0, 3).map((project) => (
                                <DashboardListItem
                                    key={project.id}
                                    title={project.name}
                                    description={project.updated_at}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Available Challenges*/}
                <div className="dashboard-card h-full gap-4 p-4 bg-gray-100 rounded-lg shadow-md flex flex-col">
                    <DashboardCard
                    title="Available Challenges"
                    viewAll={true}
                    viewAllLink="/challenges"
                    />
                    
                        <DashboardListItem
                            title="Beginner Maze"
                            description="Learn the basics of movement"
                        >
                            <Link
                                to="/challenges/1"
                                className="text-blue-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                                Start
                            </Link>
                        </DashboardListItem>

                        <DashboardListItem
                            title="Follow the Line"
                            description="Use sensors to navigate"
                        >
                            <Link
                                to="/challenges/2"
                                className="text-blue-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                                Start
                            </Link>
                        </DashboardListItem>

                        <DashboardListItem
                            title="Avoid Obstacles"
                            description="Navigate around obstacles"
                        >
                            <Link
                                to="/challenges/3"
                                className="text-blue-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                                Start
                            </Link>
                        </DashboardListItem> 
                </div>
                
                
                    
            </section>
        </div>
        
    );
}

export default StudentDashboard;
