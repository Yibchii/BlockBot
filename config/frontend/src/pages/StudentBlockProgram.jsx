import { useState } from "react";
import BlocklyComponent from "../components/BlocklyComponent";
import Console from "./StudentProgramConsole";
import Simulator from "./StudentProgramSimulator";
import "./StudentBlockProgram.css";


export default function StudentWorkspace() {
  const [projectName, setProjectName] = useState("Maze Runner");
  const [showHelp, setShowHelp] = useState(false);
  const status = { state: "idle", title: "Ready to edit", msg: "Drag blocks into the workspace to build your program." };

  return (
    <div className="student-page">
      <header className="studio-toolbar">
        <div className="studio-brand"><img src="/static/frontend/images/robot.svg" alt="" /><strong>BlockBot Studio</strong></div>
        <label className="project-name">
          <img src="/static/frontend/images/folder.svg" alt="" />
          <input aria-label="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </label>
        <div className="studio-actions" aria-label="Program actions">
          {[["save", "save.svg", "Save"], ["run", "play-icon.svg", "Run"], ["stop", null, "Stop / Reset"], ["submit", "send.svg", "Submit"]].map(([type, icon, label]) => (
            <button key={type} type="button" className={`toolbar-button toolbar-${type}`} disabled title="Preview only — not connected yet">
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
            <div className="blockly-container"><BlocklyComponent /></div>
          </section>
          <div className="student-side">
            <Simulator robotPos={{ x: 38, y: 55 }} />
            <Console status={status} showHelp={showHelp} onToggleHelp={() => setShowHelp(v => !v)} />
          </div>
        </div>
      </div>
    </div>
  );
}