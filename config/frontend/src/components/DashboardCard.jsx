import { Link } from "react-router-dom";

function DashboardCard({src, title, content, progress, button, viewAll, viewAllLink}) {
    return (
        <div className="dashboard-card p-2 bg-gray-100 rounded-lg ">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">{title}</h2>

                {viewAll && (
                    <Link
                        to={viewAllLink}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        View All
                    </Link>
                )}
            </div>

            {src && <img src={src} alt="" loading="lazy" />}
            
            <p>{content}</p>
            {progress !== undefined && (
                <div className="mt-4">
                    <div
                        role="progressbar"
                        aria-label="Learning progress"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="w-full bg-gray-300 rounded-full h-3"
                    >
                        <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm mt-2">{progress}% Complete</p>
                </div>
            )}
            {button && (
                <button className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 mt-4">
                    Continue &rarr;
                </button>
            )}
        </div>
    );
}

export default DashboardCard;