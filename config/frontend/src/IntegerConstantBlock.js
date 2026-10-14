import * as Blockly from 'blockly';

// Register the block once.
if (!Blockly.Blocks['integer_constant']) {
  Blockly.Blocks['integer_constant'] = {
    init: function () {
      // Start at zero.
      const numberField = new Blockly.FieldNumber(0);

      // Accept whole numbers; reject decimals and unsafe values.
      numberField.setValidator((value) =>
        Number.isSafeInteger(value) ? value : null
      );

      // Display an editable integer value.
      this.appendDummyInput()
        .appendField('integer:')
        .appendField(numberField, 'NUM');

      // Allow connections to blocks expecting a number.
      this.setOutput(true, 'Number');

      this.setColour('#5b67a5');
      this.setTooltip(
        'A whole-number constant, such as -5, 0, or 5. Decimals are not allowed.'
      );
      this.setHelpUrl('');
    }
  };
}