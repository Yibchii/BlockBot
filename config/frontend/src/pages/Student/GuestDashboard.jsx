import { Link } from "react-router-dom";
import { Save, LogIn } from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import DashboardListItem from "../../components/DashboardListItem";

// "No account" dashboard (Trello: create "no account dashboard" component).
// Shown on /home when /api/user/info/ returns 401. Guests can open the editor,
// but projects are not saved, and classroom/challenge progress needs an account.
export default function GuestDashboard() {
  return (
    <div className="guest-dashboard p-3">
      <section className="p-8 bg-gray-200 rounded-lg flex flex-wrap items-center gap-5">
        <img
          src={`${import.meta.env.BASE_URL}images/profile-silhouette.svg`}
          alt=""
          className="bg-gray-400 w-20 h-20 rounded-full"
        />
        <div>
          <h1 className="m-1 text-3xl font-bold text-left">Welcome, guest!</h1>
          <p>Try building a program with your robot. No account needed.</p>
        </div>
        <Link
          to="/editor"
          className="ml-auto bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          + New Project
        </Link>
      </section>

      <div
        role="note"
        className="mt-3 p-4 rounded-lg bg-amber-100 text-amber-950 flex flex-wrap items-center gap-3"
      >
        <Save className="w-5 h-5" aria-hidden="true" />
        <p className="flex-1 min-w-[200px]">
          Guest projects are not saved. Create an account to keep your work and join a classroom.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" /> Log in or sign up
        </Link>
      </div>

      <section className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="dashboard-card h-full p-4 bg-gray-100 rounded-lg shadow-md flex flex-col gap-3">
          <DashboardCard title="Start building" />
          <p className="text-gray-700">
            Open the editor, pick a robot, and drag blocks onto the workspace.
          </p>
          <Link
            to="/editor"
            className="self-start bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            Open editor
          </Link>
        </div>

        <div className="dashboard-card h-full p-4 bg-gray-100 rounded-lg shadow-md flex flex-col gap-3">
          <DashboardCard title="With an account" />
          <DashboardListItem title="Save projects" description="Come back to your work anytime" />
          <DashboardListItem title="Join a classroom" description="Get assignments from your instructor" />
          <DashboardListItem title="Track challenges" description="Pick up where you left off" />
        </div>
      </section>
    </div>
  );
}
