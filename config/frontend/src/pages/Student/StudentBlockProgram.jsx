import { useCallback, useEffect, useRef, useState } from "react";
import BlocklyComponent from "../../components/Blockly/BlocklyComponent";
import { runBlocklyProgram } from "../../runtime/runBlocklyProgram";
import { ROBOT_IMPLEMENTATIONS } from "../../robots/robotImplementations";
import Console from "./StudentProgramConsole";
import { generateCodePreview } from "./blockbotCodePreview";
import "./StudentBlockProgram.css";

export default function Editor() {
  const [robot, setRobot] = useState(null);
  const [availableRobots, setAvailableRobots] = useState([]);
  const [projectName, setProjectName] = useState("Maze Runner");
  const [showHelp, setShowHelp] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("Python");
  const [codePreview, setCodePreview] = useState({
    code: "",
    warning: "Blockly workspace is still loading.",
  });
  const [robotReady, setRobotReady] = useState(false);
  const [runState, setRunState] = useState("idle");
  const [paused, setPaused] = useState(false);
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
        const supportedRobots = (robots || []).filter(
          (item) => ROBOT_IMPLEMENTATIONS[item.name]?.Component
        );
        setAvailableRobots(supportedRobots);
        const selectedRobot = supportedRobots[0];
        if (!selectedRobot || !ROBOT_IMPLEMENTATIONS[selectedRobot.name]) {
          throw new Error("No supported robot is available.");
        }
        setRobot(selectedRobot);
      })
      .catch((error) =>
        setStatus({
          state: "error",
          title: "Robot unavailable",
          msg: error.message,
        })
      );
  }, []);

  useEffect(() => {
    if (!workspace || !codeOpen) return;

    const refresh = () => setCodePreview(generateCodePreview(workspace, codeLanguage));
    refresh();
    workspace.addChangeListener(refresh);
    return () => workspace.removeChangeListener(refresh);
  }, [workspace, codeOpen, codeLanguage]);

  const RobotComponent = robot
    ? ROBOT_IMPLEMENTATIONS[robot.name]?.Component
    : null;

  const handleRun = async () => {
    if (!workspace || !runtimeRef.current || runState === "running") return;

    setPaused(false);
    setRunState("running");
    setStatus({ state: "running", title: "Running", msg: "Executing your program..." });

    try {
      await runtimeRef.current.reset();
      runtimeRef.current?.start?.();
      await runBlocklyProgram(workspace, runtimeRef.current);
      setRunState("idle");
      setPaused(false);
      setStatus({ state: "success", title: "Program complete", msg: "Your robot finished the program." });
    } catch (error) {
      if (error.name === "AbortError" || error.message === "Program stopped.") {
        setRunState("idle");
        setPaused(false);
        setStatus({ state: "idle", title: "Program stopped", msg: "The robot was reset." });
        return;
      }

      setRunState("idle");
      setPaused(false);
      setStatus({ state: "error", title: "Program error", msg: error.message });
    }
  };

  const handleReset = async () => {
    setRunState("idle");
    setPaused(false);
    try {
      await runtimeRef.current?.reset?.();
    } catch (error) {
      if (error.name !== "AbortError") {
        setStatus({ state: "error", title: "Reset failed", msg: error.message });
        return;
      }
    }
    setStatus({ state: "idle", title: "Ready to edit", msg: "The robot was reset." });
  };

  const handlePauseToggle = () => {
    if (!runtimeRef.current || runState !== "running") return;
    if (paused) {
      runtimeRef.current?.resume?.();
      setPaused(false);
      setStatus({ state: "running", title: "Resumed", msg: "Program resumed." });
    } else {
      runtimeRef.current?.pause?.();
      setPaused(true);
      setStatus({ state: "running", title: "Paused", msg: "Program paused." });
    }
  };

  const actions = [
    ["save", "save.svg", "Save", true],
    ["run", "play-icon.svg", "Run", !workspace || !robotReady || runState === "running"],
    ["pause", null, paused ? "Continue" : "Pause", !workspace || !robotReady || runState !== "running"],
    ["reset", null, "Reset", false],
    ["submit", "send.svg", "Submit", true],
  ];

    return (
    <div className="student-page">
      <header className="studio-toolbar">
        <label className="project-name">
          <img src="/static/frontend/images/folder.svg" alt="" />
          <input aria-label="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </label>

        <button className="code-preview-trigger" type="button" onClick={() => setCodeOpen(true)}>
          &lt;/&gt; View Code
        </button>

        <div className="studio-actions" aria-label="Program actions">
          {actions.map(([type, icon, label, disabled]) => (
            <button
              key={type}
              type="button"
              className={`toolbar-button toolbar-${type}`}
              disabled={disabled}
              onClick={
                type === "run"
                  ? handleRun
                  : type === "reset"
                  ? handleReset
                  : type === "pause"
                  ? handlePauseToggle
                  : undefined
              }
              aria-pressed={type === "pause" ? String(paused) : undefined}
            >
              {type === "pause" ? (
                <span aria-hidden="true" className="pause-glyph">{paused ? "▶" : "⏸"}</span>
              ) : icon ? (
                <img src={`/static/frontend/images/${icon}`} alt="" />
              ) : (
                <span aria-hidden="true">■</span>
              )}
              {label}
            </button>
          ))}
        </div>

      </header>

      {codeOpen && (
        <div className="code-preview-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCodeOpen(false);
        }}>
          <section className="code-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="code-preview-title">
            <header className="code-preview-heading">
              <h2 id="code-preview-title">Generated Code</h2>
              <button type="button" onClick={() => setCodeOpen(false)} aria-label="Close code preview">×</button>
            </header>
            <div className="code-preview-controls">
              <label htmlFor="code-language">Language</label>
              <select id="code-language" value={codeLanguage} onChange={(event) => setCodeLanguage(event.target.value)}>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
              </select>
              <button type="button" onClick={() => navigator.clipboard?.writeText(codePreview.code)}>Copy Code</button>
            </div>
            {codePreview.warning && <p className="code-preview-warning" role="status">{codePreview.warning}</p>}
            <div className="code-preview-container">
              <pre className="code-preview-output"><code>{codePreview.code || 'Generating code…'}</code></pre>
            </div>
            <p className="code-preview-footnote">Read-only preview. Blockly's robot simulator continues using its existing runtime.</p>
          </section>
        </div>
      )}

      <div className="student-content">
        <div className="student-grid">
          <section className="workspace-panel" aria-label="Interactive Blockly programming editor">
            <div className="panel-header workspace-editor-header">
              <div>
                <h2>Blockly Workspace</h2>
                <span className="workspace-hint">Select a toolbox category, then drag blocks onto the canvas</span>
              </div>
              <span className="editor-badge">Interactive editor</span>
            </div>
            <div className="blockly-container">
              <BlocklyComponent onWorkspaceReady={setWorkspace} />
            </div>
          </section>

          <div className="student-side">
            <section className="student-panel simulator-panel">
              <div className="panel-header">
                <label>
                  Robot
                  <select
                    aria-label="Choose robot"
                    value={robot?.id ?? ""}
                    disabled={!availableRobots.length || runState === "running"}
                    onChange={(event) => {
                      const selected = availableRobots.find(
                        (item) => String(item.id) === event.target.value
                      );
                      if (!selected || selected.id === robot?.id) return;
                      runtimeRef.current = null;
                      setRobotReady(false);
                      setPaused(false);
                      setRobot(selected);
                      setStatus({
                        state: "idle",
                        title: "Robot selected",
                        msg: `${selected.name} selected. Your blocks are preserved.`,
                      });
                    }}
                  >
                    {!availableRobots.length && (
                      <option value="">No supported robots available</option>
                    )}
                    {availableRobots.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.robot_type})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="maze-component-container">
                {RobotComponent && <RobotComponent key={robot.id} onRuntimeReady={handleRuntimeReady} />}
              </div>
            </section>

            <Console status={status} showHelp={showHelp} onToggleHelp={() => setShowHelp(v => !v)} />
          </div>
        </div>
      </div>
    </div>
  );
}