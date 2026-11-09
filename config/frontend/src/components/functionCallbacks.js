import Blockly from 'blockly';

/**
 * Configures custom button callbacks for function creation in the Blockly workspace.
 */
export function setupFunctionCallbacks(workspace) {
  if (!workspace) return;

  workspace.registerButtonCallback('CREATE_FUNCTION', (button) => {
    const targetWorkspace = button.getTargetWorkspace();

    Blockly.dialog.prompt('Enter a function name:', '', (input) => {
      if (input === null) return;

      const name = input.trim();

      if (!name) {
        Blockly.dialog.alert('Please enter a function name.');
        return;
      }

      const nameExists = targetWorkspace.getAllBlocks(false).some((block) => {
        const isFunction =
          block.type === 'procedures_defnoreturn' ||
          block.type === 'procedures_defreturn';

        return (
          isFunction &&
          String(block.getFieldValue('NAME')).toLowerCase() ===
            name.toLowerCase()
        );
      });

      if (nameExists) {
        Blockly.dialog.alert('A function with this name already exists.');
        return;
      }

      Blockly.Events.setGroup(true);

      try {
        const otherBlocks = targetWorkspace.getTopBlocks(false);

        const bottom = otherBlocks.reduce((maximum, block) => {
          const position = block.getRelativeToSurfaceXY();
          const size = block.getHeightWidth();
          return Math.max(maximum, position.y + size.height);
        }, 0);

        const functionBlock = targetWorkspace.newBlock('procedures_defnoreturn');

        functionBlock.setFieldValue(name, 'NAME');
        functionBlock.initSvg();
        functionBlock.render();
        functionBlock.moveBy(40, bottom + 40);
        functionBlock.select();
        targetWorkspace.centerOnBlock(functionBlock.id);
      } finally {
        Blockly.Events.setGroup(false);
      }
    });
  });
}