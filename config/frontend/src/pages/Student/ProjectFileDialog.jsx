import { useEffect, useRef, useState } from "react";

export default function ProjectFileDialog({
  mode,
  projectName,
  onClose,
  onSave,
  onLoad,
}) {
  const dialogRef = useRef(null);
  const loadingProject = mode === "load";
  const [name, setName] = useState(loadingProject ? "" : projectName);
  const [projects, setProjects] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    if (!loadingProject) return;

    const controller = new AbortController();

    async function fetchProjects() {
      try {
        const response = await fetch("/api/files/files_of_user/", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not list saved projects.");
        }
        setProjects(result.save_files);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      }
    }

    fetchProjects();
    return () => controller.abort();
  }, [loadingProject]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy || !name.trim()) return;

    setBusy(true);
    setError("");

    try {
      if (loadingProject) {
        const project = projects?.find((item) => item.name === name);
        if (!project) throw new Error("Choose a saved project.");
        await onLoad(project);
      } else {
        await onSave(name.trim());
      }
    } catch (error) {
      setError(error.message || "Could not finish the project request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
    className="project-file-dialog"
    ref={dialogRef}
      aria-labelledby="project-file-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={handleSubmit}>
        <h2 id="project-file-title">
          {loadingProject ? "Load project" : "Save project"}
        </h2>

        {loadingProject ? (
          <label>
            Saved project
            <select
              required
              value={name}
              disabled={busy || !projects?.length}
              onChange={(event) => setName(event.target.value)}
            >
              <option value="">Choose a project</option>
              {projects?.map((project) => (
                <option key={project.name} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Project name
            <input
              required
              maxLength={255}
              value={name}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}

        {loadingProject && !projects && !error && <p>Loading projects…</p>}
        {loadingProject && projects?.length === 0 && <p>No saved projects yet.</p>}
        {error && <p role="alert">{error}</p>}

        <button type="button" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="submit" disabled={busy || !name.trim()}>
          {busy ? "Working…" : loadingProject ? "Load" : "Save"}
        </button>
      </form>
    </dialog>
  );
}