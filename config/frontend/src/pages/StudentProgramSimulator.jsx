export default function Simulator({ robotPos }) {
  return <section className="student-panel simulator-panel">
    <div className="panel-header"><h2>Simulator</h2><div className="simulator-tools" aria-label="Simulator preview controls"><span aria-hidden="true">↶</span><span aria-hidden="true">◎</span><span aria-hidden="true">⌂</span></div></div>
    <div className="maze-board" role="img" aria-label="Maze preview with a robot, walls, a dashed blue route and a green goal flag">
      <svg viewBox="0 0 240 195" preserveAspectRatio="none" className="maze-path" aria-hidden="true"><path d="M91 141 V47 H115 V36 H149 V141 H206 V36 H224 V17" /></svg>
      <div className="maze-wall wall-one" /><div className="maze-wall wall-two" /><div className="maze-wall wall-three" /><div className="maze-wall wall-four" /><div className="maze-wall wall-five" /><div className="maze-wall wall-six" />
      <span className="maze-goal" aria-hidden="true">⚑</span><img className="maze-robot" src="/static/frontend/images/robot.svg" alt="" style={{ left: `${robotPos.x}%`, top: `${robotPos.y}%` }} />
    </div>
  </section>;
}
