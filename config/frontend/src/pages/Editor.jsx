import BlocklyComponent from "../components/BlocklyComponent";
import MazeBot2DComponent from "../components/MazeBot2DComponent";
import "./StudentBlockProgram.css";

export default function Editor() {
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
						<h2>MazeBot2D</h2>
					</div>
					<div className="maze-component-container">
						<MazeBot2DComponent />
					</div>
				</aside>
			</div>
		</div>
	);
}
