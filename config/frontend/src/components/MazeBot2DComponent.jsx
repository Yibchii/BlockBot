import { useCallback, useEffect, useRef, useState } from "react";

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

export default function MazeBot2DComponent({ onRuntimeReady }) {
    const [grid, setGrid] = useState("");
    const [header, setHeader] = useState("");
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const runtimeRef = useRef(null);

    const handleStateChange = useCallback(({ header: nextHeader, grid: nextGrid, position: nextPosition }) => {
        setHeader(nextHeader);
        setGrid(nextGrid);
        setPosition(nextPosition);
    }, []);

    useEffect(() => {
        let positionState = { x: 0, y: 0 };
        let requestController = null;
        let stopped = false;
        let paused = false;
        let pausePromise = null;
        let resolvePause = null;

        const waitIfPaused = async () => {
            if (!paused) return;
            await pausePromise;
        };

        const publish = (data) => {
            const state = { ...data, position: { ...positionState } };
            handleStateChange(state);
            return state;
        };

        const move = async (direction) => {
            if (stopped) {
                throw new Error("Program stopped.");
            }

            await waitIfPaused();

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
            stopped = false;
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

        const runtime = { move, reset, stop, pause, resume };
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
        
	return (
        <div>
            <p>Current Position: ({position.x}, {position.y})</p>
            <pre>{grid}</pre>
        </div>
    );
}