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
    if (/[GgFf⚑★]/u.test(char)) return "goal";
    return "floor";
}

function BotFace() {
  return (
    <svg className="bb-maze-bot-svg" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#ff755f" stroke="#fff8ed" strokeWidth="2.5" />
    <path d="M24 10V7" stroke="#fff8ed" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="6" r="3" fill="#f7c85d" />
    <rect x="11" y="15" width="26" height="20" rx="7" fill="#fff8ed" />
    <circle cx="19" cy="25" r="3" fill="#17334b" /><circle cx="29" cy="25" r="3" fill="#17334b" />
    <path d="M21 31q3 3 6 0" stroke="#17334b" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="7" y="22" width="5" height="8" rx="2" fill="#ffc0a8" />
    <rect x="36" y="22" width="5" height="8" rx="2" fill="#ffc0a8" />
    </svg>
  );
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

        const publish = (data) => {
            const state = { ...data, position: { ...positionState } };
            handleStateChange(state);
            return state;
        };

        const move = async (direction) => {
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

            if (stopped) {
                throw new Error("Program stopped.");
            }

            positionState = nextPosition;
            return publish(data);
        };

        const reset = async () => {
            stopped = false;
            requestController?.abort();
            requestController = new AbortController();
            const data = await fetchGridCoordinate(0, 0, requestController.signal);
            positionState = { x: 0, y: 0 };
            return publish(data);
        };

        const stop = () => {
            stopped = true;
            requestController?.abort();
        };

        const runtime = { move, reset, stop };
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
    // The API includes a one-cell ASCII border around the 10x10 play area.
      const columns = parsed?.width ?? 10;
      const rows = parsed?.height ?? 10;
    const hasAsciiBorder = columns === GRID_MAX_INDEX + 3 && rows === GRID_MAX_INDEX + 3;
    const gridOffset = hasAsciiBorder ? 1 : 0;
    const cellX = (x) => (x + gridOffset + 0.5) * (100 / columns);
    const cellY = (y) => (y + gridOffset + 0.5) * (100 / rows);
      const goalExists = parsed?.lines.some((line) => line.some((c) => kind(c) === "goal"));
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
                const type = parsed ? kind(parsed.lines[y]?.[x] ?? " ") : "floor";
                return <div key={index} className={`bb-maze-tile bb-maze-tile-${type}`}>
                  {type === "goal" && <span className="bb-maze-goal-flag" aria-hidden="true">⚑</span>}
                </div>;
              })}
              {/* A fallback flag represents the wireframe's target, not a backend goal condition. */}
              {!goalExists && <span className="bb-maze-corner-flag" aria-hidden="true">⚑</span>}
              {trail.length > 1 && <svg className="bb-maze-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={trailPoints} /></svg>}
              <div className="bb-maze-bot" style={{ left: `${cellX(position.x)}%`, top: `${cellY(position.y)}%` }}><BotFace /></div>
            </div>
          </div>
          <div className="bb-maze-bottomline">
            <span><span className="bb-maze-key-wall" /> Walls <span className="bb-maze-key-path" /> Open path</span>
            <button type="button" className="bb-maze-ascii-toggle" onClick={() => setShowRaw((v) => !v)} aria-expanded={showRaw}>{showRaw ? "Hide ASCII" : "View ASCII"}</button>
          </div>
          {showRaw && <div className="bb-maze-raw"><div>{header}</div><pre>{grid || "Loading maze…"}</pre></div>}
        </div>
      );
}