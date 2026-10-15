import { javascriptGenerator } from "blockly/javascript";
import "../generators/mazeBotGenerators";

export function generateBlocklyProgram(workspace) {
  const startBlocks = workspace
    .getTopBlocks(true)
    .filter((block) => block.type === "start_program");

  if (startBlocks.length === 0) {
    throw new Error("Add a Start Program block before running.");
  }

  if (startBlocks.length > 1) {
    throw new Error("Use only one Start Program block.");
  }

  javascriptGenerator.init(workspace);
  const code = javascriptGenerator.blockToCode(startBlocks[0]);
  if (!code.trim()) {
    throw new Error("Add at least one instruction to the program.");
  }

  return code;
}

export async function runBlocklyProgram(workspace, robot) {
  const code = generateBlocklyProgram(workspace);
  const execute = new Function(
    "robot",
    `"use strict"; return (async () => { ${code} })();`
  );

  await execute(robot);
  return code;
}
