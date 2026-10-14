import { javascriptGenerator } from "blockly/javascript";

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

  return `await robot.move(${direction});\n`;
};

javascriptGenerator.forBlock["start_program"] = () => "";
