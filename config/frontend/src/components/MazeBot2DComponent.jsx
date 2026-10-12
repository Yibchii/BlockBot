import React, { useEffect, useState } from 'react';

export default function MazeBot2DComponent() 
{
    const [grid, setGrid] = useState("");
    const [header, setHeader] = useState("");
    
    const [blocksConfirmation, setBlocksConfirmation] = useState("");
    
    useEffect(() => {
        fetch("/api/mazebot2d/grid/")
        .then((response) => response.json())
        .then((data) => {
            setHeader(data.header);
            setGrid(data.grid);
        })
        .catch((error) => console.error("Error:", error));
        fetch("/api/mazebot2d/blocks")
        .then((response) => response.json())
        .then((data) => {
            setBlocksConfirmation(data.confirmation);
        })
        .catch((error) => console.error("Error:", error));
    }, []);
        
	return (
        <div>
            <p>{header}</p>
            <p>{blocksConfirmation}</p>
            <pre>{grid}</pre>
        </div>
    );
}