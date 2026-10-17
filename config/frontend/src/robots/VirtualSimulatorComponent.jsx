import React, { useEffect, useRef } from "react";
import { RobotSimulator } from "./robotSimulator";

export function VirtualSimulatorComponent({ onRuntimeReady }) {
    const canvasRef = useRef(null);
    const simulatorRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const simulator = new RobotSimulator(canvasRef.current.id);
            simulator.init();
            simulatorRef.current = simulator;

            const runtimeAPI = {
                reset: async () => {
                    simulator.stopLoop();
                    simulator.robot.x = simulator.canvas.width / 2;
                    simulator.robot.y = simulator.canvas.height / 2;
                    simulator.robot.angle = 0;
                    simulator.startLoop();
                },
                stop: () => {
                    simulator.commandQueue = [];
                    simulator.currentCommand = null;
                },
                enqueueCommands: (cmds) => {
                    simulator.enqueueCommands(cmds);
                }
            };

            onRuntimeReady(runtimeAPI);

            return () => {
                simulator.stopLoop();
            };
        }
    }, [onRuntimeReady]);

    return (
        <div className="flex flex-col items-center justify-center p-2">
            <canvas 
                id="browserRobotCanvas" 
                ref={canvasRef} 
                width="400" 
                height="350" 
                className="border border-gray-700 bg-gray-900 rounded shadow-inner"
            />
        </div>
    );
}