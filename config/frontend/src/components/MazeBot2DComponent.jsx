import { useCallback, useEffect, useState } from 'react';

async function fetchGridCoordinate(nextX, nextY) {
    const response = await fetch(`/api/mazebot2d/grid/?x=${nextX}&y=${nextY}`);
    const data = await response.json();

    if (!response.ok || typeof data.grid !== "string") {
        return null;
    }

    return data;
}

export function move(direction) {
    const offsets = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0],
    };
    const offset = offsets[direction];

    if (!offset) {
        return null;
    }

    return offset;
}

export default function MazeBot2DComponent() 
{
    const [grid, setGrid] = useState("");
    const [header, setHeader] = useState("");
    const [blocksConfirmation, setBlocksConfirmation] = useState("");
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const updateGridCoordinate = useCallback(async (nextX, nextY) => {
        try {
            const data = await fetchGridCoordinate(nextX, nextY);
            if (!data) {
                return false;
            }

            setHeader(data.header);
            setGrid(data.grid);
            setX(nextX);
            setY(nextY);
            return true;
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
    }, []);

    const handleMove = useCallback((direction) => {
        const offset = move(direction);
        if (!offset) {
            return false;
        }

        return updateGridCoordinate(x + offset[0], y + offset[1]);
    }, [updateGridCoordinate, x, y]);

    useEffect(() => {
        fetchGridCoordinate(0, 0)
        .then((data) => {
            if (data) {
                setHeader(data.header);
                setGrid(data.grid);
            }
        })
        .catch((error) => console.error("Error:", error));

        fetch("/api/mazebot2d/blocks")
        .then((response) => response.json())
        .then((data) => {
            setBlocksConfirmation(data.confirmation);
        })
        .catch((error) => console.error("Error:", error));
    }, [updateGridCoordinate]);
        
	return (
        <div>
            <p>{header}</p>
            <p>{blocksConfirmation}</p>
            <p>Current Position: ({x}, {y})</p>
            <div>
                <button type="button" onClick={() => handleMove("up")}>
                    Up
                </button>
                <button type="button" onClick={() => handleMove("down")}>
                    Down
                </button>
                <button type="button" onClick={() => handleMove("left")}>
                    Left
                </button>
                <button type="button" onClick={() => handleMove("right")}>
                    Right
                </button>
            </div>
            <pre>{grid}</pre>
        </div>
    );
}