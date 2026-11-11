import { javascriptGenerator } from "blockly/javascript";
import "../generators/mazeBotGenerators";

const MAX_LOOP_CHECKS = 10000;

javascriptGenerator.addReservedWords("robot,__blockbotCheckLoop,__blockbotStep");

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

  const previousTrap = javascriptGenerator.INFINITE_LOOP_TRAP;
  const previousPrefix = javascriptGenerator.STATEMENT_PREFIX;

  try {
    javascriptGenerator.INFINITE_LOOP_TRAP =
      "__blockbotCheckLoop();\n";
    javascriptGenerator.STATEMENT_PREFIX = "await __blockbotStep(%1);\n";

    javascriptGenerator.init(workspace);
    const code = javascriptGenerator.blockToCode(startBlocks[0]);

    if (!code.trim()) {
      throw new Error("Add at least one instruction to the program.");
    }

    return javascriptGenerator.finish(code);
  } finally {
    javascriptGenerator.INFINITE_LOOP_TRAP = previousTrap;
    javascriptGenerator.STATEMENT_PREFIX = previousPrefix;
  }
}

export async function runBlocklyProgram(workspace, robot, { onStep } = {}) {
  const code = generateBlocklyProgram(workspace);
  let loopChecks = 0;

  const checkLoop = () => {
    loopChecks += 1;

    if (loopChecks > MAX_LOOP_CHECKS) {
      throw new Error(
        "Your program exceeded the loop safety limit and was stopped. " +
        "Check your loop condition or use a smaller repeat count, then try again."
      );
    }
  };
  const step = async (blockId) => {      
    if (onStep) {                        
      await onStep(blockId);             
    }                                    
  };                                     


  const execute = new Function(
    "robot",
    "__blockbotCheckLoop",
    "__blockbotStep",
    `"use strict"; return (async () => { ${code} })();`
  );

  try {
    await execute(robot, checkLoop, step);
    return code;
  } catch (error) {
    // Stop the robot and abort any pending movement request.
    try {
      await robot.stop();
    } catch (stopError) {
      console.error("Could not stop the robot:", stopError);
    }

    throw error;
  }
}