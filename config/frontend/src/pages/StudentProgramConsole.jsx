export default function Console({ status }) {
  return (
    <section className={`student-panel console-panel console-${status.state}`}>
      <div className="panel-header panel-header-compact">
        <div>
          <p className="panel-kicker">Activity</p>
          <h2>Program status</h2>
        </div>
        <span className="status-label">{status.state}</span>
      </div>
      <div className="console-message">
        <strong>{status.title}</strong>
        <p>{status.msg}</p>
      </div>
      <div className="console-tip"><span>i</span> Drag blocks from the toolbox into the canvas.</div>
    </section>
  );
}