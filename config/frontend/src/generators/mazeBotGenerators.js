import { javascriptGenerator, Order } from "blockly/javascript";

const BLOCK_EXECUTION_DELAY_MS = 250;

javascriptGenerator.forBlock["direction_constant"] = (block) => {
  const direction = block.getFieldValue("DIRECTION");
  return [JSON.stringify(direction), Order.ATOMIC];
};

javascriptGenerator.forBlock["mazebot2d_move"] = (block, generator) => {
  const direction =
    generator.valueToCode(
      block,
      "DIRECTION",
      Order.NONE
    ) || "undefined";

  return `await robot.move(${direction});\nawait new Promise((resolve) => setTimeout(resolve, ${BLOCK_EXECUTION_DELAY_MS}));\n`;
};

javascriptGenerator.forBlock["mazebot2d_can_move"] = (block, generator) => {
  const direction =
    generator.valueToCode(
      block,
      "DIRECTION",
      Order.NONE
    ) || "undefined";

  return [`robot.can_move(${direction})`, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["mazebot2d_on_goal"] = () => {
  return [`robot.on_goal()`, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["start_program"] = () => "";

const defineProcedure = javascriptGenerator.forBlock.procedures_defreturn;
const callProcedure = javascriptGenerator.forBlock.procedures_callreturn;

function defineAsyncProcedure(block, generator) {
  const name = generator.getProcedureName(block.getFieldValue("NAME"));
  const definitionKey = "%" + name;

  defineProcedure(block, generator);
  generator.definitions_[definitionKey] =
    generator.definitions_[definitionKey].replace(/^function /m, "async function ");

  return null;
}

javascriptGenerator.forBlock.procedures_defreturn = defineAsyncProcedure;
javascriptGenerator.forBlock.procedures_defnoreturn = defineAsyncProcedure;
javascriptGenerator.forBlock.procedures_callreturn = (block, generator) => {
  const [call] = callProcedure(block, generator);
  return [`(await ${call})`, Order.ATOMIC];
};