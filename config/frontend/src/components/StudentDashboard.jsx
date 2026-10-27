function StudentDashboard({user}) {
    return (
        <div className="student-dashboard p-5">
            {/* Student Avatar Section */}
            <section className="avatar-section bg-blue-100 p-6 rounded-lg flex items-center gap-">
                <img src={`${import.meta.env.BASE_URL}images/profile-silhouette.svg`} 
                     alt="Student Avatar" 
                     className="avatar w-20 h-20 rounded-full object-cover" 
                />
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome back, {user.first_name}!
                    </h1>
                    <p className="text-gray-600">
                        Keep learning and build something amazing with your robot!
                    </p>
                </div>
                <button className="ml-auto bg-blue-500 text-white p-2 rounded-full"> + New Project </button>

            </section>

                
            
        </div>
    );
}

export default StudentDashboard;
