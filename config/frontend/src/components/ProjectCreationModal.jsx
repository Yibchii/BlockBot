import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ROBOT_IMPLEMENTATIONS } from "../robots/robotImplementations";
import "./ProjectCreationModal.css";

// Mount when open. onCreate is an optional async integration point for a real
// creation API; the caller handles confirmed success (for example navigation).
export default function ProjectCreationModal({ onClose, onCreate }) {
  const dialogRef = useRef(null);
  const submittingRef = useRef(false);
  const id = useId();
  const [name, setName] = useState("");
  const [robotId, setRobotId] = useState("");
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const trigger = document.activeElement;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadRobots() {
      try {
        const response = await fetch("/api/robots/", { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load robot types. Please try again.");
        const data = await response.json();
        if (!Array.isArray(data.robots)) throw new Error("The robot API returned an invalid response.");
        const supported = data.robots.filter((robot) =>
          robot && robot.id != null && ROBOT_IMPLEMENTATIONS[robot.name]?.Component
        );
        if (!controller.signal.aborted) setRobots(supported);
      } catch (failure) {
        if (!controller.signal.aborted) {
          setLoadError(failure instanceof Error ? failure.message : "Unable to load robot types.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadRobots();
    return () => controller.abort();
  }, [attempt]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;
    const projectName = name.trim();
    if (!projectName || projectName.length > 255) {
      setError("Enter a project name between 1 and 255 characters.");
      return;
    }
    const robot = robots.find((item) => String(item.id) === robotId);
    if (loading || loadError || !robot) {
      setError("Select an available robot type.");
      return;
    }
    if (!onCreate) {
      setError("Project creation is not available yet: the backend creation API has not been connected. Your project has not been saved.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      await onCreate({ name: projectName, robot_id: robot.id });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to create your project. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className="project-creation-modal"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault();
        if (!submittingRef.current) onClose();
      }}
    >
      <h2 id={`${id}-title`}>Create New Project</h2>
      <p id={`${id}-description`}>Choose a name and robot for your project.</p>
      <form onSubmit={handleSubmit} aria-busy={submitting}>
        <label htmlFor={`${id}-name`}>Project name <span aria-hidden="true">*</span></label>
        <input
          id={`${id}-name`} name="projectName" autoFocus required maxLength={255}
          value={name} disabled={submitting} placeholder="Enter a project name"
          onChange={(event) => { setName(event.target.value); setError(""); }}
        />
        <label htmlFor={`${id}-robot`}>Robot type <span aria-hidden="true">*</span></label>
        <select
          id={`${id}-robot`} name="robotId" required value={robotId}
          disabled={loading || Boolean(loadError) || robots.length === 0 || submitting}
          onChange={(event) => { setRobotId(event.target.value); setError(""); }}
        >
          <option value="">{loading ? "Loading robot types…" : "Select a robot type"}</option>
          {robots.map((robot) => <option key={robot.id} value={robot.id}>{robot.name} ({robot.robot_type})</option>)}
        </select>
        <div aria-live="polite">
          {loading && <p>Loading available robot types…</p>}
          {loadError && <>
            <p className="project-creation-error" role="alert">{loadError}</p>
            <button type="button" onClick={() => {
              setLoadError(""); setLoading(true); setRobotId(""); setError("");
              setAttempt((value) => value + 1);
            }}>Retry loading robots</button>
          </>}
          {!loading && !loadError && robots.length === 0 && <p>No supported robots are available. A project cannot be created right now.</p>}
        </div>
        {!onCreate && <p className="project-creation-notice">Project saving is currently unavailable because the backend creation API is not connected.</p>}
        {error && <p className="project-creation-error" role="alert">{error}</p>}
        <div className="project-creation-actions">
          <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="project-creation-primary" type="submit" disabled={loading || Boolean(loadError) || robots.length === 0 || submitting}>
            {submitting ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
