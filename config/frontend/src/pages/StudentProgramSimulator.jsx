export default function Simulator({ robotPos }) {
  return (
    <section className="student-panel simulator-panel">
      <div className="panel-header panel-header-compact">
        <div>
          <p className="panel-kicker">Preview</p>
          <h2>Maze simulator</h2>
        </div>
        <span className="live-label">LIVE</span>
      </div>
      <div className="maze-board" aria-label="MazeBot simulator">
        <div className="maze-start">START</div>
        <div className="maze-goal">GOAL</div>
        <div className="robot" style={{ left: `${robotPos.x}%`, top: `${robotPos.y}%` }} aria-label="Robot position">R</div>
      </div>
      <div className="coordinate-readout">
        <span>Robot position</span>
        <strong>{robotPos.x}, {robotPos.y}</strong>
      </div>
    </section>
  );
}