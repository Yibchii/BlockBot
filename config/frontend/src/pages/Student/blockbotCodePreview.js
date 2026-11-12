
import { pythonGenerator } from "blockly/python";
import { javascriptGenerator } from "blockly/javascript";

// Use the actual JavaScript generators from BlockBot.
import "../../generators/mazeBotGenerators";

// Python translations of our custom blocks.
pythonGenerator.forBlock["start_program"] = () => "";

pythonGenerator.forBlock["direction_constant"] = (block, generator) => {
  const direction = block.getFieldValue("DIRECTION") || "UP";
  return [JSON.stringify(direction), generator.ORDER_ATOMIC];
};

pythonGenerator.forBlock["mazebot2d_move"] = (block, generator) => {
  const direction = generator.valueToCode(
    block, "DIRECTION", generator.ORDER_NONE
  ) || "None";

  return `robot.move(${direction})\n`;
};

pythonGenerator.forBlock["mazebot2d_can_move"] = (block, generator) => {
  const direction = generator.valueToCode(
    block, "DIRECTION", generator.ORDER_NONE
  ) || "None";

  return [
    `robot.can_move(${direction})`,
    generator.ORDER_FUNCTION_CALL
  ];
};

pythonGenerator.forBlock["mazebot2d_on_goal"] = (block, generator) => [
  "robot.on_goal()",
  generator.ORDER_FUNCTION_CALL
];

// Support the custom integer block.
const integerValue = (block) => {
  const field =
    block.getFieldValue("NUM") ??
    block.getFieldValue("VALUE");

  const number = Number(field);

  if (field == null || !Number.isFinite(number)) {
    throw new Error(
      "Cannot read integer_constant value. Check its field name."
    );
  }

  return number;
};

pythonGenerator.forBlock["integer_constant"] =
  (block, generator) => [
    String(integerValue(block)),
    generator.ORDER_ATOMIC
  ];

if (!javascriptGenerator.forBlock["integer_constant"]) {
  javascriptGenerator.forBlock["integer_constant"] =
    (block, generator) => [
      String(integerValue(block)),
      generator.ORDER_ATOMIC
    ];
}

export function generateCodePreview(workspace, language = "Python") {
  if (!workspace) {
    return {
      code: "",
      warning: "Blockly workspace is still loading."
    };
  }

  const generator =
    language === "JavaScript"
      ? javascriptGenerator
      : pythonGenerator;

  const startBlocks = workspace
    .getTopBlocks(true)
    .filter(
      (block) =>
        block.type === "start_program" &&
        block.isEnabled()
    );

  if (startBlocks.length !== 1) {
    return {
      code: "",
      warning: startBlocks.length === 0
        ? "Add a Start Program block to preview your program."
        : "Use only one Start Program block."
    };
  }

  try {
    generator.init(workspace);

    const fragment = generator.blockToCode(startBlocks[0]);

    if (
      typeof fragment !== "string" ||
      !fragment.trim()
    ) {
      return {
        code: "",
        warning: "Add instructions below Start Program."
      };
    }

    const generated = generator.finish(fragment).trim();

    if (language === "JavaScript") {
      const indented = generated
        .split("\n")
        .map((line) => line ? `  ${line}` : line)
        .join("\n");

      return {
        code:
          `// BlockBot Studio JavaScript preview\n` +
          `// Requires the BlockBot robot API.\n` +
          `async function main(robot) {\n` +
          `${indented}\n` +
          `}\n\n` +
          `// Call main(robot) in a BlockBot-compatible runtime.`,
        warning:
          "JavaScript preview uses the existing MazeBot generators. " +
          "It requires the BlockBot robot runtime."
      };
    }

    const indented = generated
      .split("\n")
      .map((line) => line ? `    ${line}` : line)
      .join("\n");

    return {
      code:
        `# BlockBot Studio Python preview\n` +
        `# Requires a compatible Python robot API.\n` +
        `def main(robot):\n` +
        `${indented}\n`,
      warning:
        "Python is a teaching-oriented translation, not directly " +
        "executable against the current JavaScript robot runtime."
    };

  } catch (error) {
    return {
      code: "",
      warning:
        `Could not generate ${language} code: ${error.message}`
    };
  }
}