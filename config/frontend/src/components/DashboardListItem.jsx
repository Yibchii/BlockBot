function DashboardListItem({ title, description, children }) {
    return (
        <div className="dashboard-list-item bg-white p-3 flex items-center justify-between rounded-lg shadow-md">
            <div>
                <h2 className="text-lg font-bold text-left">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {children}
        </div>
    );
}

export default DashboardListItem;
