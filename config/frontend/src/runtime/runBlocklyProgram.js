import { javascriptGenerator } from "blockly/javascript";
import "../generators/mazeBotGenerators";

const MAX_LOOP_CHECKS = 10000;
const MAX_RUN_TIME_MS = 30000;

// Keep student variable names from conflicting with runtime helpers.
javascriptGenerator.addReservedWords("robot,__blockbotCheckLoop");

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

  try {
    // Add a safety check inside generated loops and functions.
    javascriptGenerator.INFINITE_LOOP_TRAP =
      "__blockbotCheckLoop();\n";

    javascriptGenerator.init(workspace);
    const code = javascriptGenerator.blockToCode(startBlocks[0]);

    if (!code.trim()) {
      throw new Error("Add at least one instruction to the program.");
    }

    return javascriptGenerator.finish(code);
  } finally {
    javascriptGenerator.INFINITE_LOOP_TRAP = previousTrap;
  }
}

export async function runBlocklyProgram(workspace, robot) {
  const code = generateBlocklyProgram(workspace);
  const startedAt = Date.now();
  let loopChecks = 0;

  const checkLoop = () => {
    loopChecks += 1;

    if (
      loopChecks > MAX_LOOP_CHECKS ||
      Date.now() - startedAt >= MAX_RUN_TIME_MS
    ) {
      throw new Error(
        "Your program repeated too many times or ran too long. " +
        "Check your loop condition or use a smaller repeat count, then try again."
      );
    }
  };

  const execute = new Function(
    "robot",
    "__blockbotCheckLoop",
    `"use strict"; return (async () => { ${code} })();`
  );

  await execute(robot, checkLoop);
  return code;
}
