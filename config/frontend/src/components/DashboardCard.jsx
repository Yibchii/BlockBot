function DashboardCard({src, title, content, progress, button}) {
    return (
        <div className="dashboard-card p-2 bg-gray-100 rounded-lg ">
            <h1 className="text-xl font-bold mb-3 flex flex-col items-start">{title}</h1>
            {src && <img src={src} alt={title} loading="lazy" />}
            
            <p>{content}</p>
            {progress !== undefined && (
                <div className="mt-4">
                    <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm mt-2">{progress}% Complete</p>
                </div>
            )}
            {button && (
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Continue
                </button>
            )}
        </div>
    );
}

export default DashboardCard;