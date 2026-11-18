import { useCallback, useEffect, useRef, useState } from "react";
import { serialization } from "blockly";
import ProjectFileDialog from "./ProjectFileDialog";
import BlocklyComponent from "../../components/Blockly/BlocklyComponent";
import { runBlocklyProgram } from "../../runtime/runBlocklyProgram";
import { ROBOT_IMPLEMENTATIONS } from "../../robots/robotImplementations";
import { loadBlocksFromApi } from "../../blockGen";
import Console from "./StudentProgramConsole";
import { generateCodePreview } from "./blockbotCodePreview";
import "./StudentBlockProgram.css";

export default function Editor() {
  const [robot, setRobot] = useState(null);
  const [robotBlockTypes, setRobotBlockTypes] = useState([]);
  const [availableRobots, setAvailableRobots] = useState([]);
  const [projectName, setProjectName] = useState("Maze Runner");
  const [fileMode, setFileMode] = useState(null);
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
  const [stepping, setStepping] = useState(false);
  const [status, setStatus] = useState({
    state: "idle",
    title: "Ready to edit",
    msg: "Drag blocks into the workspace to build your program.",
  });
  const runtimeRef = useRef(null);
  const stepModeRef = useRef(false);
  const releaseStepRef = useRef(null);
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

  // Register the selected robot's blocks and expose them in the toolbox.
  useEffect(() => {
    const blocksUrl = robot && ROBOT_IMPLEMENTATIONS[robot.name]?.blocksUrl;
    if (!blocksUrl) {
      setRobotBlockTypes([]);
      return;
    }

    let cancelled = false;
    loadBlocksFromApi(blocksUrl)
      .then((data) => {
        if (cancelled) return;
        setRobotBlockTypes((data.blocks?.blocks ?? []).map((def) => def.type));
      })
      .catch((error) => {
        if (cancelled) return;
        setRobotBlockTypes([]);
        setStatus({
          state: "error",
          title: "Robot blocks unavailable",
          msg: error.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [robot]);

  useEffect(() => {
    if (!workspace || !codeOpen) return;

    const refresh = () => setCodePreview(generateCodePreview(workspace, codeLanguage));
    refresh();
    workspace.addChangeListener(refresh);
    return () => workspace.removeChangeListener(refresh);
  }, [workspace, codeOpen, codeLanguage]);
  
  // Register the selected robot's blocks and expose them in the toolbox.
  useEffect(() => {
    const blocksUrl = robot && ROBOT_IMPLEMENTATIONS[robot.name]?.blocksUrl;
    if (!blocksUrl) {
      setRobotBlockTypes([]);
      return;
    }

    let cancelled = false;
    loadBlocksFromApi(blocksUrl)
      .then((data) => {
        if (cancelled) return;
        setRobotBlockTypes((data.blocks?.blocks ?? []).map((def) => def.type));
      })
      .catch((error) => {
        if (cancelled) return;
        setRobotBlockTypes([]);
        setStatus({
          state: "error",
          title: "Robot blocks unavailable",
          msg: error.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [robot]);

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

  const waitForStep = async () => {
    if (!stepModeRef.current) return;
    setStatus({ state: "running", title: "Step mode", msg: "Click Step to run the next block." });
    await new Promise((resolve) => {
      releaseStepRef.current = resolve;
    });
    if (!stepModeRef.current) throw new Error("Program stopped.");
  };

  const startProgram = async (stepMode) => {
    if (!workspace || !runtimeRef.current || runState === "running") return;

    stepModeRef.current = stepMode;
    setStepping(stepMode);
    setPaused(false);
    setRunState("running");
    setStatus({ state: "running", title: "Running", msg: "Executing your program..." });

    try {
      await runtimeRef.current.reset();
      runtimeRef.current?.start?.();
      await runBlocklyProgram(workspace, runtimeRef.current, { onStep: waitForStep });
      stepModeRef.current = false;
      setStepping(false);
      setRunState("idle");
      setPaused(false);
      setStatus({ state: "success", title: "Program complete", msg: "Your robot finished the program." });
    } catch (error) {
      stepModeRef.current = false;
      setStepping(false);
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

    const handleRun = () => startProgram(false);

  const handleStep = () => {
    if (runState !== "running") {
      startProgram(true);
      return;
    }
    const release = releaseStepRef.current;
    releaseStepRef.current = null;
    release?.();
  };

  const handleReset = async () => {
    stepModeRef.current = false;
    setStepping(false);
    releaseStepRef.current?.();
    releaseStepRef.current = null;
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

  async function handleSaveProject(name) {
    if (name.includes("/") || name === "." || name === "..") {
      throw new Error("Use a project name without slashes or standalone periods.");
    }

    const csrfToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrftoken="))
      ?.slice("csrftoken=".length);

    const response = await fetch(
      `/api/files/save_file/${encodeURIComponent(name)}/${robot.id}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken ?? "",
        },
        body: JSON.stringify(serialization.workspaces.save(workspace)),
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || "Could not save the project.");
    }

    setProjectName(name);
    setFileMode(null);
    setStatus({ state: "success", title: "Project saved", msg: name });
  }
  async function handleLoadProject(project) {
    const savedRobot = availableRobots.find((item) => item.id === project.robot);
    if (!savedRobot) {
      throw new Error("This project uses a robot that is unavailable.");
    }

    if (workspace.getAllBlocks(false).length > 0 &&
        !window.confirm("Replace the current blocks with this saved project?")) {
      return;
    }

    const response = await fetch(
      `/api/files/load_file/${encodeURIComponent(project.name)}/`
    );
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || "Could not load the project.");
    }

    const savedWorkspace = JSON.parse(result.content);
    if (!savedWorkspace || typeof savedWorkspace !== "object" || Array.isArray(savedWorkspace)) {
      throw new Error("The saved workspace is invalid.");
    }

    await loadBlocksFromApi(ROBOT_IMPLEMENTATIONS[savedRobot.name].blocksUrl);

    const previousWorkspace = serialization.workspaces.save(workspace);
    try {
      serialization.workspaces.load(savedWorkspace, workspace);
    } catch (error) {
      serialization.workspaces.load(previousWorkspace, workspace);
      throw error;
    }

    if (savedRobot.id !== robot?.id) {
      runtimeRef.current = null;
      setRobotReady(false);
      setRobot(savedRobot);
    }

    setProjectName(project.name);
    setFileMode(null);
    setStatus({ state: "success", title: "Project loaded", msg: project.name });
  }
  const actions = [
    ["load", null, "Load", !workspace || !availableRobots.length || runState === "running"],
    ["save", "save.svg", "Save", !workspace || !robot || runState === "running"],
    ["run", "play-icon.svg", "Run", !workspace || !robotReady || runState === "running"],
    ["step", null, "Step", !workspace || !robotReady || (runState === "running" && !stepping)],
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
                type === "save" || type === "load"
                  ? () => setFileMode(type)
                  : type === "run"
                    ? handleRun
                    : type === "reset"
                      ? handleReset
                      : type === "pause"
                        ? handlePauseToggle
                        : type === "step"
                          ? handleStep
                          : undefined
              }
              aria-pressed={type === "pause" ? String(paused) : undefined}
            >
              {type === "pause" ? (
                <span aria-hidden="true" className="pause-glyph">{paused ? "▶" : "⏸"}</span>
                ) : type === "step" ? (
                <span aria-hidden="true">⏭</span>
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

      {fileMode && (
        <ProjectFileDialog
          mode={fileMode}
          projectName={projectName}
          onClose={() => setFileMode(null)}
          onSave={handleSaveProject}
          onLoad={handleLoadProject}
        />
      )}

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
              <BlocklyComponent onWorkspaceReady={setWorkspace} robotBlockTypes={robotBlockTypes} />
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
