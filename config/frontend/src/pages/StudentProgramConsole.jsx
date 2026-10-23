
export default function Console({ status, showHelp, onToggleHelp }) {
  const isError = status.state === "error";
  const isRunning = status.state === "running";

  const statusIcon = isError ? "!" : isRunning ? "…" : "✓";

  return (
    <section className={`student-panel console-panel console-${status.state}`}>
      <div className="panel-header">
        <h2>Console / Feedback</h2>
      </div>

      <div
        className="console-message"
        role={isError ? "alert" : "status"}
      >
        <span className="feedback-check" aria-hidden="true">
          {statusIcon}
        </span>
        <div>
          <strong>{status.title}</strong>
          <p>{status.msg}</p>
        </div>
      </div>

      <button
        className="ai-help-button"
        type="button"
        onClick={onToggleHelp}
        aria-expanded={showHelp}
      >
        ✦ {showHelp ? "Hide tips" : "AI Help"}
      </button>

      {showHelp && (
        <div className="help-card">
          <strong>Programming tip</strong>
          <p>
            Use a repeat loop for repeated moves, and check that the
            path is clear before moving forward.
          </p>
        </div>
      )}
    </section>
  );
}
