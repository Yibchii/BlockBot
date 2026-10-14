import BlocklyComponent from "../components/BlocklyComponent";
import { useEffect, useState } from "react";
import { ROBOT_IMPLEMENTATIONS } from "../robots/robotImplementations";
import "./StudentBlockProgram.css";

export default function Editor() {
	const [robot, setRobot] = useState(null);

	useEffect(() => {
		fetch("/api/robots/")
			.then((response) => {
				if (!response.ok) throw new Error("Unable to load available robots.");
				return response.json();
			})
			.then(({ robots }) => setRobot(robots?.[0] || null))
			.catch((error) => console.error("Error loading robots:", error));
	}, []);

	const RobotComponent = robot
		? ROBOT_IMPLEMENTATIONS[robot.name]?.Component
		: null;

	return (
		<div className="standalone-editor-page">
			<div className="standalone-editor-grid">
				<section className="workspace-panel" aria-label="Interactive Blockly programming editor">
					<div className="panel-header workspace-editor-header">
						<div>
							<h2>Blockly Workspace</h2>
							<span className="workspace-hint">Build your program with blocks</span>
						</div>
						<span className="editor-badge">Interactive editor</span>
					</div>
					<div className="blockly-container">
						<BlocklyComponent />
					</div>
				</section>
				<aside className="standalone-maze-panel" aria-label="MazeBot2D simulator">
					<div className="panel-header">
						<h2>{robot?.name || "Robot"}</h2>
					</div>
					<div className="maze-component-container">
						{RobotComponent && <RobotComponent />}
					</div>
				</aside>
			</div>
		</div>
	);
}
