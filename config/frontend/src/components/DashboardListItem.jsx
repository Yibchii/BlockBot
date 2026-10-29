function DashboardListItem({title, description, children}) {
    return (
        <div className="dashboard-list-item p-4 bg-white rounded-lg shadow-md ">
            <h1 className="text-xl font-bold mb-3 text-left">{title}</h1>
            <p>{description}</p>
            {children}
        </div>
    );
}

export default DashboardListItem;