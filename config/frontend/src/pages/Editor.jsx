import BlocklyComponent from "../components/BlocklyComponent";
import "./Student_Block_Program.css";

export default function Editor() {
	return (
		<div className="standalone-editor-page">
			<div className="blockly-container">
				<BlocklyComponent />
			</div>
		</div>
	);
}
