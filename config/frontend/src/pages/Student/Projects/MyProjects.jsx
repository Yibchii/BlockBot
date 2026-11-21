import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Blocks, Bot, Files, FolderOpen, LayoutTemplate, Plus, Search, Users } from "lucide-react";
import ProjectCreationModal from "../../../components/ProjectCreationModal";
{/*import { createProject } from "../../api/projects";*/}
import "./MyProjects.css";

export default function MyProjects() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const basePath = pathname.startsWith("/static/frontend") ? "/static/frontend" : "";
  const [projects, setProjects] = useState([]);
  const [robots, setRobots] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [robotError, setRobotError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProjects() {
      try {
        const response = await fetch("/api/files/files_of_user/", {
          signal: controller.signal, credentials: "same-origin",
        });
        if (response.status === 401) throw new Error("Please log in to view your projects.");
        if (!response.ok) throw new Error("Unable to load your projects. Please try again.");
        const data = await response.json();
        if (!Array.isArray(data.save_files) || data.save_files.some((project) =>
          !project || !Number.isInteger(project.id) || typeof project.name !== "string" || project.robot == null
        )) throw new Error("The project list could not be read. Please try again.");
        if (!controller.signal.aborted) setProjects(data.save_files);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message || "Unable to load your projects.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    async function loadRobots() {
      try {
        const response = await fetch("/api/robots/", {
          signal: controller.signal, credentials: "same-origin",
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!Array.isArray(data.robots) || data.robots.some((robot) =>
          !robot || robot.id == null || typeof robot.name !== "string"
        )) throw new Error();
        if (!controller.signal.aborted) setRobots(data.robots);
      } catch {
        if (!controller.signal.aborted) setRobotError("Robot filters are unavailable. You can still browse and search your projects.");
      }
    }
    loadProjects();
    loadRobots();
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setLoading(true);
    setError("");
    setRobotError("");
    setCategory("all");
    setAttempt((value) => value + 1);
  }

  const query = search.trim().toLowerCase();
  const visibleProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(query) &&
    (category === "all" || String(project.robot) === category)
  );
  // The API exposes robot IDs, not editorial categories such as "Sensor".
  const categories = robots.filter((robot) => projects.some((project) =>
    String(project.robot) === String(robot.id)
  ));

  return (
    <div className="my-projects">
      <aside className="projects-sidebar">
        <h2><Files size={19} aria-hidden="true" />Projects</h2>
        <nav aria-label="Projects navigation">
          <NavLink to={`${basePath}/projects`} end><Blocks size={18} aria-hidden="true" />My Projects</NavLink>
          <button type="button" disabled title="Shared projects are coming soon"><Users size={18} aria-hidden="true" />Shared With Me</button>
          <button type="button" disabled title="Templates are coming soon"><LayoutTemplate size={18} aria-hidden="true" />Templates</button>
        </nav>
      </aside>

      <section className="projects-content" aria-labelledby="my-projects-title">
        <header className="projects-heading">
          <div>
            <h1 id="my-projects-title">My Projects</h1>
            <p>Access and manage your saved projects.</p>
          </div>
          <div className="projects-tools">
            <button className="projects-primary" type="button" onClick={() => setModalOpen(true)}><Plus size={17} aria-hidden="true" />New Project</button>
            <label className="projects-search">
              <Search size={17} aria-hidden="true" />
              <input type="search" aria-label="Search projects" placeholder="Search projects…" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>
        </header>

        <div className="projects-filters" role="group" aria-label="Filter projects by robot">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>All</button>
          {categories.map((robot) => <button key={robot.id} type="button" aria-pressed={category === String(robot.id)} onClick={() => setCategory(String(robot.id))}>{robot.name}</button>)}
        </div>

        {robotError && !error && <div className="projects-notice" role="status">{robotError} <button type="button" onClick={retry}>Retry</button></div>}
        <div aria-live="polite" aria-busy={loading}>
          {loading ? <div className="projects-state"><FolderOpen size={36} aria-hidden="true" /><p>Loading your projects…</p></div>
            : error ? <div className="projects-state" role="alert"><p>{error}</p><button type="button" className="projects-primary" onClick={retry}>Try again</button></div>
            : projects.length === 0 ? <div className="projects-state"><FolderOpen size={40} aria-hidden="true" /><h2>No projects yet</h2><p>Create your first project to start building.</p><button type="button" className="projects-primary" onClick={() => setModalOpen(true)}><Plus size={17} aria-hidden="true" />New Project</button></div>
            : visibleProjects.length === 0 ? <div className="projects-state"><Search size={36} aria-hidden="true" /><h2>No matching projects</h2><p>Try another name or robot filter.</p><button type="button" onClick={() => { setSearch(""); setCategory("all"); }}>Clear filters</button></div>
            : <>
              <p className="projects-count">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}</p>
              <div className="projects-grid">
                {visibleProjects.map((project) => {
                  const robot = robots.find((item) => String(item.id) === String(project.robot));
                  return <article className="project-card" key={project.id}>
                    <div className="project-card-icon"><Bot size={42} strokeWidth={1.6} aria-hidden="true" /></div>
                    <h2>{project.name}</h2>
                    <p>{robot ? robot.name : `Robot #${project.robot}`}</p>
                    <Link className="projects-primary" to={`${basePath}/editor?project=${project.id}`} aria-label={`Open ${project.name}`}>Open</Link>
                  </article>;
                })}
              </div>
            </>}
        </div>
      </section>
      {modalOpen && <ProjectCreationModal onClose={() => setModalOpen(false)} onCreate={async (details) => {
        const project = await createProject(details);
        navigate(`${basePath}/editor?project=${project.id}`);
      }} />}
    </div>
  );
}
