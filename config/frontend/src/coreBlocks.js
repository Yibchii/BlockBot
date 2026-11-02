import * as Blockly from "blockly";

const CORE_BLOCKS = [
  {
    type: "start_program",
    message0: "start program",
    nextStatement: null,
    colour: "#5b80a5",
    tooltip: "Starting point for a program.",
    helpUrl: "",
  },
];

const newDefinitions = CORE_BLOCKS.filter((block) => !Blockly.Blocks[block.type]);
if (newDefinitions.length > 0) {
  Blockly.common.defineBlocksWithJsonArray(newDefinitions);
}

