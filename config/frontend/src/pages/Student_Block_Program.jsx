import { useRef, useState } from "react";
import BlocklyComponent from "../components/BlocklyComponent";
import Console from "./StudentProgramConsole";
import Simulator from "./StudentProgramSimulator";
import "./Student_Block_Program.css";


export default function StudentWorkspace() {
  const workspaceRef = useRef(null);
  const [robotPos, setRobotPos] = useState({ x: 37, y: 61 });
  const [status, setStatus] = useState({ state: "idle", title: "Ready", msg: "Build a program, then run it." });

  const handleRun = () => {
    const blockCount = workspaceRef.current?.getAllBlocks(false).length ?? 0;
    setStatus({
      state: "run",
      title: "Program ready",
      msg: blockCount ? `${blockCount} block${blockCount === 1 ? "" : "s"} queued for execution.` : "Add blocks to the workspace first."
    });
  };

  const handleReset = () => {
    setRobotPos({ x: 37, y: 61 });
    setStatus({ state: "idle", title: "Ready", msg: "Build a program, then run it." });
  };

  const handleSave = () => {
    setStatus({ state: "saved", title: "Program saved", msg: "Your blocks are saved in this workspace." });
  };

  const handleSubmit = () => {
    setStatus({ state: "submitted", title: "Program submitted", msg: "Your teacher can now review this workspace." });
  };

  return (
    <div className="student-page">
      <header className="studio-toolbar">
        <div className="studio-brand">
          <img className="brand-mark" src="/static/frontend/images/robot.svg" alt="BlockBot robot" />
          <strong>BlockBot Studio</strong>
        </div>
        <div className="project-name">
          <img className="project-folder-icon" src="/static/frontend/images/folder.svg" alt="" />
          <span>Maze Runner</span>
        </div>
        <div className="studio-actions">
          <button type="button" className="toolbar-button toolbar-save" onClick={handleSave} aria-label="Save">
            <img className="toolbar-icon save-icon" src="/static/frontend/images/save.svg" alt="" aria-hidden="true" />
            <span className="toolbar-label">Save</span>
          </button>
          <button type="button" className="toolbar-button toolbar-run" onClick={handleRun} aria-label="Run">
            <img className="toolbar-icon run-icon" src="/static/frontend/images/play-icon.svg" alt="" aria-hidden="true" />
            <span className="toolbar-label">Run</span>
          </button>
          <button type="button" className="toolbar-button toolbar-stop" onClick={handleReset} aria-label="Stop or reset">
            <span className="toolbar-icon stop-icon" aria-hidden="true" />
            <span className="toolbar-label">Stop / Reset</span>
          </button>
          <button type="button" className="toolbar-button toolbar-submit" onClick={handleSubmit} aria-label="Submit">
            <img className="toolbar-icon submit-icon" src="/static/frontend/images/send.svg" alt="" aria-hidden="true" />
            <span className="toolbar-label">Submit</span>
          </button>
        </div>
        <div className="student-account">
          <span className="account-avatar"><img src="/static/frontend/images/profile-silhouette.svg" alt="Student profile" /></span>
          <span>Student</span>
          <span className="account-caret" aria-hidden="true" />
        </div>
      </header>
      <div className="student-content">
        <div className="student-heading">
          <h1>Student programming workspace</h1>
        </div>

        <div className="student-grid">
          <section className="workspace-panel">
            <div className="panel-header">
              <div>
                <div className="workspace-tabs"><button type="button" className="workspace-tab active">Blocks</button><button type="button" className="workspace-tab">Python</button></div>
              </div>
              <span className="workspace-state"><span className="state-dot" />Ready to edit</span>
            </div>
            <BlocklyComponent onWorkspaceReady={(workspace) => (workspaceRef.current = workspace)} />
          </section>
          <Simulator robotPos={robotPos} />
          <Console status={status} />
        </div>
      </div>
    </div>
  );
}