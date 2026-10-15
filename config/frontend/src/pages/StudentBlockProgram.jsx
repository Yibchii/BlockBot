import { useCallback, useEffect, useRef, useState } from "react";
import BlocklyComponent from "../components/BlocklyComponent";
import { runBlocklyProgram } from "../runtime/runBlocklyProgram";
import { ROBOT_IMPLEMENTATIONS } from "../robots/robotImplementations";
import Console from "./StudentProgramConsole";
import "./StudentBlockProgram.css";


export default function Editor() {
  const [robot, setRobot] = useState(null);
  const [projectName, setProjectName] = useState("Maze Runner");
  const [showHelp, setShowHelp] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [robotReady, setRobotReady] = useState(false);
  const [runState, setRunState] = useState("idle");
  const [status, setStatus] = useState({
    state: "idle",
    title: "Ready to edit",
    msg: "Drag blocks into the workspace to build your program.",
  });
  const runtimeRef = useRef(null);
  const handleRuntimeReady = useCallback((runtime) => {
    runtimeRef.current = runtime;
    setRobotReady(Boolean(runtime));
  }, []);

  useEffect(() => {
    fetch("/api/robots/")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load available robots.");
        return response.json();
      })
      .then(({ robots }) => {
        const selectedRobot = robots?.[0];
        if (!selectedRobot || !ROBOT_IMPLEMENTATIONS[selectedRobot.name]) {
          throw new Error("No supported robot is available.");
        }
        setRobot(selectedRobot);
      })
      .catch((error) => setStatus({
        state: "error",
        title: "Robot unavailable",
        msg: error.message,
      }));
  }, []);

  const RobotComponent = robot
    ? ROBOT_IMPLEMENTATIONS[robot.name]?.Component
    : null;

  const handleRun = async () => {
    if (!workspace || !runtimeRef.current || runState === "running") return;

    setRunState("running");
    setStatus({ state: "running", title: "Running", msg: "Executing your program..." });

    try {
      await runtimeRef.current.reset();
      await runBlocklyProgram(workspace, runtimeRef.current);
      setRunState("idle");
      setStatus({ state: "success", title: "Program complete", msg: "Your robot finished the program." });
    } catch (error) {
      if (error.name === "AbortError" || error.message === "Program stopped.") {
        setRunState("idle");
        setStatus({ state: "idle", title: "Program stopped", msg: "The robot was reset." });
        return;
      }

      setRunState("idle");
      setStatus({ state: "error", title: "Program error", msg: error.message });
    }
  };

  const handleStop = async () => {
    runtimeRef.current?.stop();
    setRunState("idle");
    try {
      await runtimeRef.current?.reset();
    } catch (error) {
      if (error.name !== "AbortError") {
        setStatus({ state: "error", title: "Reset failed", msg: error.message });
        return;
      }
    }
    setStatus({ state: "idle", title: "Ready to edit", msg: "The robot was reset." });
  };

  const actions = [
    ["save", "save.svg", "Save", true],
    ["run", "play-icon.svg", "Run", !workspace || !robotReady || runState === "running"],
    ["stop", null, "Stop / Reset", false],
    ["submit", "send.svg", "Submit", true],
  ];

  return (
    <div className="student-page">
      <header className="studio-toolbar">
        <div className="studio-brand"><img src="/static/frontend/images/robot.svg" alt="" /><strong>BlockBot Studio</strong></div>
        <label className="project-name">
          <img src="/static/frontend/images/folder.svg" alt="" />
          <input aria-label="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </label>
        <div className="studio-actions" aria-label="Program actions">
          {actions.map(([type, icon, label, disabled]) => (
            <button key={type} type="button" className={`toolbar-button toolbar-${type}`} disabled={disabled} onClick={type === "run" ? handleRun : type === "stop" ? handleStop : undefined}>
              {icon ? <img src={`/static/frontend/images/${icon}`} alt="" /> : <span aria-hidden="true">■</span>}{label}
            </button>
          ))}
        </div>
        <div className="student-account"><img src="/static/frontend/images/profile-silhouette.svg" alt="" /><span>Student</span></div>
      </header>
      <div className="student-content">
        <div className="student-grid">
          <section className="workspace-panel" aria-label="Interactive Blockly programming editor">
            <div className="panel-header workspace-editor-header">
              <div><h2>Blockly Workspace</h2><span className="workspace-hint">Select a toolbox category, then drag blocks onto the canvas</span></div>
              <span className="editor-badge">Interactive editor</span>
            </div>
            <div className="blockly-container"><BlocklyComponent onWorkspaceReady={setWorkspace} /></div>
          </section>
          <div className="student-side">
            <section className="student-panel simulator-panel">
              <div className="panel-header"><h2>{robot?.name || "Robot"}</h2></div>
              <div className="maze-component-container">
                {RobotComponent && <RobotComponent onRuntimeReady={handleRuntimeReady} />}
              </div>
            </section>
            <Console status={status} showHelp={showHelp} onToggleHelp={() => setShowHelp(v => !v)} />
          </div>
        </div>
      </div>
    </div>
  );
}