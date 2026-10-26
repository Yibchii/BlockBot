import { javascriptGenerator } from "blockly/javascript";

const BLOCK_EXECUTION_DELAY_MS = 250;

javascriptGenerator.forBlock["direction_constant"] = (block) => {
  const direction = block.getFieldValue("DIRECTION");
  return [JSON.stringify(direction), javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["mazebot2d_move"] = (block, generator) => {
  const direction =
    generator.valueToCode(
      block,
      "DIRECTION",
      javascriptGenerator.ORDER_NONE
    ) || "undefined";

  return `await robot.move(${direction});\nawait new Promise((resolve) => setTimeout(resolve, ${BLOCK_EXECUTION_DELAY_MS}));\n`;
};

javascriptGenerator.forBlock["mazebot2d_can_move"] = (block, generator) => {
  const direction =
    generator.valueToCode(
      block,
      "DIRECTION",
      javascriptGenerator.ORDER_NONE
    ) || "undefined";

  return [`robot.can_move(${direction})`, javascriptGenerator.ORDER_FUNCTION_CALL];
};


javascriptGenerator.forBlock["start_program"] = () => "";
