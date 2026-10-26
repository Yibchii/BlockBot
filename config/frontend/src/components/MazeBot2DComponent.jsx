import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./MazeBot2DComponent.css";


const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

const OFFSETS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const GRID_MAX_INDEX = 9;

async function fetchGridCoordinate(x, y, signal) {
  const response = await fetch(`/api/mazebot2d/grid/?x=${x}&y=${y}`, { signal });
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("MazeBot2D returned an invalid response.");
  }

  if (!response.ok || typeof data.grid !== "string") {
    throw new Error(data.error || "MazeBot2D could not update the robot position.");
  }

  return data;
}

// only interprets characters for display
function parseGrid(text) {
    const lines = text.replace(/\r/g, "").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines.at(-1).trim()) lines.pop();
    if (!lines.length) return null;
    const width = Math.max(...lines.map((line) => [...line].length));
    if (!width) return null;
    return { lines: lines.map((line) => [...line]), width, height: lines.length };
}

function kind(char) {
    if (/[#█▓▒■Xx]/u.test(char) || /[+|─│┌┐└┘┬┴├┤┼═║╔╗╚╝]/u.test(char)) return "wall";
    if (/[GgFf⚑★*]/u.test(char)) return "goal";
    return "floor";
}

function BotFace() {
    // Files in public/ are served from the Vite base URL without the public/ prefix.
    return <img className="bb-maze-bot-logo" src={`${import.meta.env.BASE_URL}images/robot.svg`} alt="" draggable="false" />;
}

export default function MazeBot2DComponent({ onRuntimeReady }) {
  const [grid, setGrid] = useState("");
  const [header, setHeader] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] =  useState([{ x: 0, y: 0 }]);
  const [showRaw, setShowRaw] = useState(false);
  const runtimeRef = useRef(null);

  const handleStateChange = useCallback(({ header: nextHeader, grid: nextGrid, position: nextPosition }) => {
    setHeader(nextHeader);
    setGrid(nextGrid);
    setPosition(nextPosition);
        setTrail((previous) => {
            if (nextPosition.x === 0 && nextPosition.y === 0) return [{ x: 0, y: 0 }];
            const last = previous[previous.length - 1];
            if (last?.x === nextPosition.x && last?.y === nextPosition.y) return previous;
            return [...previous, nextPosition];
        })
  }, []);

  useEffect(() => {
    let positionState = { x: 0, y: 0 };
    let requestController = null;
    let stopped = false;
    let paused = false;
    let pausePromise = null;
    let resolvePause = null;
    let currentGrid = "";

    const waitIfPaused = async () => {
      if (!paused) return;
      await pausePromise;
    };

    const publish = (data) => {
      currentGrid = data.grid;
      const state = { ...data, position: { ...positionState } };
      handleStateChange(state);
      return state;
    };

    const move = async (direction) => {
      if (stopped) {
        throw new Error("Program stopped.");
      }

      await waitIfPaused();

      if (stopped) {
        throw new Error("Program stopped.");
      }

      const apiDirection = DIRECTIONS[direction];
      if (!apiDirection) {
        throw new Error(`Unsupported direction: ${String(direction)}`);
      }

      const [xOffset, yOffset] = OFFSETS[apiDirection];
      const nextPosition = {
        x: Math.max(0, Math.min(GRID_MAX_INDEX, positionState.x + xOffset)),
        y: Math.max(0, Math.min(GRID_MAX_INDEX, positionState.y + yOffset)),
      };

      requestController?.abort();
      requestController = new AbortController();
      const data = await fetchGridCoordinate(
        nextPosition.x,
        nextPosition.y,
        requestController.signal
      );

      await waitIfPaused();

      if (stopped) {
        throw new Error("Program stopped.");
      }

      positionState = nextPosition;
      return publish(data);
    };

    const reset = async () => {
      stopped = true;
      if (paused && resolvePause) {
        resolvePause();
        paused = false;
        pausePromise = null;
        resolvePause = null;
      }
      requestController?.abort();
      requestController = new AbortController();
      const data = await fetchGridCoordinate(0, 0, requestController.signal);
      positionState = { x: 0, y: 0 };
      return publish(data);
    };

    const can_move = (direction) => {
      const apiDirection = DIRECTIONS[String(direction).toUpperCase()];
      if (!apiDirection || !currentGrid) return false;

      const [xOffset, yOffset] = OFFSETS[apiDirection];
      const nextX = positionState.x + xOffset;
      const nextY = positionState.y + yOffset;
      if (nextX < 0 || nextX > GRID_MAX_INDEX || nextY < 0 || nextY > GRID_MAX_INDEX) {
        return false;
      }

      const parsed = parseGrid(currentGrid);
      if (!parsed) return false;

      const hasAsciiBorder = parsed.width === GRID_MAX_INDEX + 3 && parsed.height === GRID_MAX_INDEX + 3;
      const gridLines = hasAsciiBorder
        ? parsed.lines.slice(1, -1).map((line) => line.slice(1, -1))
        : parsed.lines;
      const cell = gridLines[nextY]?.[nextX];
      const cellType = kind(cell ?? "#");
      return cellType === "floor" || cellType === "goal";
    };

    const on_goal = () => {
      if (!currentGrid) return false;

      const parsed = parseGrid(currentGrid);
      if (!parsed) return false;

      const hasAsciiBorder = parsed.width === GRID_MAX_INDEX + 3 && parsed.height === GRID_MAX_INDEX + 3;
      const gridLines = hasAsciiBorder
        ? parsed.lines.slice(1, -1).map((line) => line.slice(1, -1))
        : parsed.lines;
      const cell = gridLines[positionState.y]?.[positionState.x];
      const cellType = kind(cell ?? "#");
      return cellType === "goal";
    };

    const stop = () => {
      stopped = true;
      if (paused && resolvePause) {
        resolvePause();
        paused = false;
        pausePromise = null;
        resolvePause = null;
      }
      requestController?.abort();
    };

    const pause = () => {
      if (!paused) {
        paused = true;
        pausePromise = new Promise((resolve) => { resolvePause = resolve; });
      }
    };

    const resume = () => {
      if (paused && resolvePause) {
        resolvePause();
        paused = false;
        pausePromise = null;
        resolvePause = null;
      }
    };

    const start = () => {
      stopped = false;
      if (paused && resolvePause) {
        resolvePause();
        paused = false;
        pausePromise = null;
        resolvePause = null;
      }
    };

    const runtime = { move, reset, stop, pause, resume, start, can_move, on_goal };
    runtimeRef.current = runtime;
    onRuntimeReady?.(runtime);

    runtime.reset().catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Error initializing MazeBot2D:", error);
      }
    });

    return () => {
      runtime.stop();
      onRuntimeReady?.(null);
    };
  }, [handleStateChange, onRuntimeReady]);

    const handleMove = (direction) => {
        runtimeRef.current?.move(direction.toUpperCase()).catch((error) => {
            if (error.name !== "AbortError" && error.message !== "Program stopped.") {
                console.error("Error moving MazeBot2D:", error);
            }
        });
    };
        
	const parsed = useMemo(() => parseGrid(grid), [grid]);
        const hasAsciiBorder = parsed?.width === GRID_MAX_INDEX + 3 && parsed.height === GRID_MAX_INDEX + 3;
        // ASCII borders are framing characters, not playable rows or columns.
        const gridLines = hasAsciiBorder
                ? parsed.lines.slice(1, -1).map((line) => line.slice(1, -1))
                : parsed?.lines;
        const columns = gridLines ? Math.max(...gridLines.map((line) => line.length)) : GRID_MAX_INDEX + 1;
        const rows = gridLines?.length ?? GRID_MAX_INDEX + 1;
        const cellX = (x) => (x + 0.5) * (100 / columns);
        const cellY = (y) => (y + 0.5) * (100 / rows);
            const goalExists = gridLines?.some((line) => line.some((c) => kind(c) === "goal"));
      const trailPoints = trail.map((p) => `${cellX(p.x)},${cellY(p.y)}`).join(" ");
    
      return (
        <div className="bb-maze">
          <div className="bb-maze-topline">
            <span className="bb-maze-label"><span className="bb-maze-live" /> Maze Simulator</span>
            <span className="bb-maze-coordinate">Robot: ({position.x}, {position.y})</span>
          </div>
          <div className="bb-maze-shell">
            <div className="bb-maze-board" role="img" aria-label={`Robot maze. Robot at x ${position.x}, y ${position.y}.`} style={{ "--bb-cols": columns, "--bb-rows": rows, aspectRatio: `${columns} / ${rows}` }}>
              {Array.from({ length: rows * columns }, (_, index) => {
                const x = index % columns;
                const y = Math.floor(index / columns);
                const type = gridLines ? kind(gridLines[y]?.[x] ?? " ") : "floor";
                return <div key={index} className={`bb-maze-tile bb-maze-tile-${type}`}>
                  {type === "goal" && <span className="bb-maze-goal-flag" aria-hidden="true">⚑</span>}
                </div>;
              })}
              {/* A fallback flag represents the wireframe's tar , not a backend goal condition. */}
              {!goalExists && <span className="bb-maze-corner-flag" style={{ left: `${cellX(GRID_MAX_INDEX)}%`, top: `${cellY(0)}%` }} aria-hidden="true">⚑</span>}
              {trail.length > 1 && <svg className="bb-maze-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={trailPoints} /></svg>}
              <div className="bb-maze-bot" style={{ left: `${cellX(position.x)}%`, top: `${cellY(position.y)}%` }}><BotFace /></div>
            </div>
          </div>
          <div className="bb-maze-bottomline">
            <span><span className="bb-maze-key-wall" /> Walls <span className="bb-maze-key-path" /> Open path</span>
          </div>
          {showRaw && <div className="bb-maze-raw"><div>{header}</div><pre>{grid || "Loading maze…"}</pre></div>}
        </div>
      );
}