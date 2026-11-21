import { useCallback, useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import ProjectFileDialog from "./ProjectFileDialog";
import BlocklyComponent from "../../components/Blockly/BlocklyComponent";
import { runBlocklyProgram } from "../../runtime/runBlocklyProgram";
import { ROBOT_IMPLEMENTATIONS } from "../../robots/robotImplementations";
import { loadBlocksFromApi } from "../../blockGen";
import Console from "./StudentProgramConsole";
import { generateCodePreview } from "./blockbotCodePreview";
import "./StudentBlockProgram.css";
import { Share2 } from "lucide-react";
const WORKSPACE_STORAGE_KEY = "blockbot.student.workspace.v1";

export default function Editor() {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUsername, setShareUsername] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [robot, setRobot] = useState(null);
  const [environmentId, setEnvironmentId] = useState("hard");
  const [environments, setEnvironments] = useState([]);
  const [environmentError, setEnvironmentError] = useState("");
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
  const [status, setStatus] = useState({
    state: "idle",
    title: "Ready to edit",
    msg: "Drag blocks into the workspace to build your program.",
  });
  const runtimeRef = useRef(null);
  const [blocksInitialized, setBlocksInitialized] = useState(false);
  const hasRestoredRef = useRef(false);
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
      .catch((error) => {
        setBlocksInitialized(true);
        setStatus({
          state: "error",
          title: "Robot unavailable",
          msg: error.message,
      });
      });
  }, []);

  // Register the selected robot's blocks and expose them in the toolbox.
  useEffect(() => {
    if (!robot) return;

    const blocksUrl = robot && ROBOT_IMPLEMENTATIONS[robot.name]?.blocksUrl;
    if (!blocksUrl) {
      setRobotBlockTypes([]);
      setBlocksInitialized(true);
      return;
    }

    let cancelled = false;
    loadBlocksFromApi(blocksUrl)
      .then((data) => {
        if (cancelled) return;
        setRobotBlockTypes((data.blocks?.blocks ?? []).map((def) => def.type));
        setBlocksInitialized(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setRobotBlockTypes([]);
        setBlocksInitialized(true);
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
    if (!workspace || !blocksInitialized) return;

    if (!hasRestoredRef.current) {
      hasRestoredRef.current = true;
      try {
        const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
        if (raw) {
          const savedState = JSON.parse(raw);
          Blockly.serialization.workspaces.load(savedState, workspace);
        }
      } catch (error) {
        console.warn("Failed to restore saved Blockly workspace:", error);
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      }
    }

    const handleWorkspaceChange = (event) => {
      if (event.isUiEvent || workspace.isDragging()) return;
      try {
        const state = Blockly.serialization.workspaces.save(workspace);
        localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to persist Blockly workspace:", error);
      }
    };

    workspace.addChangeListener(handleWorkspaceChange);
    return () => workspace.removeChangeListener(handleWorkspaceChange);
  }, [workspace, blocksInitialized]);

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
        body: JSON.stringify(Blockly.serialization.workspaces.save(workspace)),
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
  async function handleShareProject(event) {
  event.preventDefault();
  setShareError("");

  const username = shareUsername.trim();
  const name = projectName.trim();

  if (!username) {
    setShareError("Please enter a recipient username.");
    return;
  }

  if (!name) {
    setShareError("Please save your project first.");
    return;
  }

  setSharing(true);

  try {
    // Find the current project's actual database ID.
    const listResponse = await fetch("/api/files/files_of_user/", {
      credentials: "same-origin",
    });

    const listResult = await listResponse.json();

    if (!listResponse.ok) {
      throw new Error(
        listResult.message || "Could not find saved projects."
      );
    }

    const project = (listResult.save_files || []).find(
      (item) => item.name === name
    );

    if (!project || !project.id) {
      throw new Error(
        "Project not found. Save your project before sharing."
      );
    }

    const csrfToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrftoken="))
      ?.slice("csrftoken=".length);

    const response = await fetch(
      `/api/projects/${project.id}/share/`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken ?? "",
        },
        body: JSON.stringify({ username }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Could not share the project."
      );
    }

    setShareOpen(false);
    setShareUsername("");
    setStatus({
      state: "success",
      title: "Project shared",
      msg: `Shared with ${username}`,
    });
  } catch (error) {
    setShareError(error.message || "Sharing failed.");
  } finally {
    setSharing(false);
  }
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

    const previousWorkspace = Blockly.serialization.workspaces.save(workspace);
    try {
      Blockly.serialization.workspaces.load(savedWorkspace, workspace);
    } catch (error) {
      Blockly.serialization.workspaces.load(previousWorkspace, workspace);
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
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/mazebot2d/environments/", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load maze environments.");
        return response.json();
      })
      .then(({ environments }) => setEnvironments(environments))
      .catch((error) => {
        if (error.name !== "AbortError") setEnvironmentError(error.message);
      });
    return () => controller.abort();
  }, []);

  const actions = [
    ["load", null, "Load", !workspace || !availableRobots.length || runState === "running"],
    ["save", "save.svg", "Save", !workspace || !robot || runState === "running"],
    ["share", null, "Share", !workspace || !robot || runState === "running"],
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
                type === "save" || type === "load"
                  ? () => setFileMode(type)
                  : type === "share"
                  ? () => setShareOpen(true)
                  : type === "run"
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
              <span aria-hidden="true" className="pause-glyph">
                {paused ? "▶" : "Ⅱ"}
              </span>
            ) : type === "share" ? (
              <Share2 size={16} aria-hidden="true" />
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
      {shareOpen && (
  <div className="code-preview-backdrop">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-project-title"
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        width: "420px",
        maxWidth: "90vw",
        margin: "15vh auto"
      }}
    >
      <h2 id="share-project-title">Share Project</h2>

      <form onSubmit={handleShareProject}>
        <label htmlFor="share-username">
          Recipient username
        </label>

        <input
          id="share-username"
          type="text"
          value={shareUsername}
          onChange={(e) => setShareUsername(e.target.value)}
          placeholder="Enter username"
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            margin: "12px 0"
          }}
        />

        {shareError && (
          <p role="alert" style={{ color: "red" }}>
            {shareError}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setShareOpen(false);
            setShareError("");
          }}
          disabled={sharing}
        >
          Cancel
        </button>

        <button type="submit" disabled={sharing}>
          {sharing ? "Sharing..." : "Share"}
        </button>
      </form>
    </div>
  </div>
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
                {robot?.name === "MazeBot2D" && (
                  <label>
                    Environment{" "}
                    <select
                      value={environmentId}
                      disabled={!environments.length || runState === "running"}
                      onChange={(event) => {
                        const nextId = event.target.value;
                        if (runState === "running" || nextId === environmentId) return;
                        runtimeRef.current?.stop?.();
                        handleRuntimeReady(null);
                        setEnvironmentId(nextId);
                        setStatus({
                          state: "idle",
                          title: "Environment changed",
                          msg: "The maze was reset. Your blocks are still in the workspace.",
                        });
                      }}
                    >
                      {!environments.length && (
                        <option value="hard">{environmentError || "Loading environments..."}</option>
                      )}
                      {environments.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </label>
                )}
                {RobotComponent && (
                  <RobotComponent
                    key={`${robot.id}:${environmentId}`}
                    environmentId={environmentId}
                    onRuntimeReady={handleRuntimeReady}
                  />
                )}
              </div>
            </section>

            <Console status={status} showHelp={showHelp} onToggleHelp={() => setShowHelp(v => !v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
