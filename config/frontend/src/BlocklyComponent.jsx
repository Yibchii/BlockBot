import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import './IntegerConstantBlock';

// Define the custom Direction Constant block
if (!Blockly.Blocks['direction_constant']) {
  Blockly.Blocks['direction_constant'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('direction:')
        .appendField(
          new Blockly.FieldDropdown([
            ['forward', 'FORWARD'],
            ['backward', 'BACKWARD'],
            ['left', 'LEFT'],
            ['right', 'RIGHT']
          ]),
          'DIRECTION'
        );
      this.setOutput(true, 'String');
      this.setColour('#e67e22');
      this.setTooltip('Specifies a direction constant.');
      this.setHelpUrl('');
    }
  };
}

export default function BlocklyComponent() {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Define basic toolbox categories including Directions
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Logic',
          colour: '#5b80a5',
          contents: [
            { 
              kind: 'block', 
              type: 'controls_if' 
            },
            {
              kind: 'block',
              type: 'logic_compare'
            },
            {
              kind: 'block',
              type: 'logic_operation'
            },
            {
              kind: 'block',
              type: 'logic_boolean'
            },
            {
              kind: 'block',
              type: 'logic_negate'
            },
            {
              kind: 'block',
              type: 'logic_ternary'
            }
          ]
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#5ba55b',
          contents: [
            { 
              kind: 'block', 
              type: 'controls_repeat_ext' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'controls_whileUntil'
            },
            {
              kind: 'block',
              type: 'controls_for' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'controls_forEach'
            },
            {
              kind: 'block',
              type: 'controls_flow_statements'
            }
          ]
        },
        {
          kind: 'category',
          name: 'Math',
          colour: '#5b67a5',
          contents: [
            { 
              kind: 'block', 
              type: 'math_number' 
            },
            {
              kind: 'block',
              type: 'integer_constant'
            },
            {
              kind: 'block',
              type: 'math_arithmetic' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_single' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_trig' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_constant'
            },
            {
              kind: 'block',
              type: 'math_number_property' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_round' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_on_list' 
            },
            {
              kind: 'block',
              type: 'math_modulo' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_constrain' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_random_int' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'math_random_float'
            }
          ]
        },
        {
          kind: 'category',
          name: 'Text',
          colour: '#dede07',
          contents: [
            { kind: 'block', 
              type: 'text' 
            },
            {
              kind: 'block',
              type: 'text_join'
            },
            {
              kind: 'block',
              type: 'text_append' // add shadow block
            },
            {
              kind: 'block',
              type: 'text_length' // add shadow block
            },
            {
              kind: 'block',
              type: 'text_isEmpty' // add shadow block
            },
            {
              kind: 'block',
              type: 'text_indexOf' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_charAt' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_getSubstring' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_changeCase' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_trim' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_count' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_replace' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_reverse' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_print' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'text_prompt_ext' // add shadow blocks
            }
          ]
        },
        {
          kind: 'category',
          name: 'Lists',
          colour: '#11b2b2',
          contents: [
            { 
              kind: 'block', 
              type: 'lists_create_empty' 
            },
            {
              kind: 'block',
              type: 'lists_create_with'
            },
            {
              kind: 'block',
              type: 'lists_repeat' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_length'
            },
            {
              kind: 'block',
              type: 'lists_isEmpty'
            },
            {
              kind: 'block',
              type: 'lists_indexOf' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_getIndex' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_setIndex' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_getSublist' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_split' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_sort' // add shadow blocks
            },
            {
              kind: 'block',
              type: 'lists_reverse' // add shadow blocks
            }
          ]
        },
        {
          kind: 'category',
          name: 'Variables',
          colour: '#a55b80',
          contents: [
            {
              kind: 'block',
              type: 'variables_get'
            },
            {
              kind: 'block',
              type: 'variables_set'
            }
          ]
        },
        {
          kind: 'category',
          name: 'Functions',
          colour: '#995ba5',
          contents: [
            {
              kind: 'block',
              type: 'procedures_defnoreturn' // add shadow block
            },
            {
              kind: 'block',
              type: 'procedures_defreturn' // add shadow block
            },
            {
              kind: 'block',
              type: 'procedures_ifreturn', 
              inputs: {
                CONDITION: {
                  shadow: {
                    type: 'logic_boolean',
                    fields: {
                      BOOL: 'FALSE'
                    }
                  }
                }
              }
            },
            { 
              kind: 'block', 
              type: 'math_number' 
            }
          ]
        },
        {
          kind: 'category',
          name: 'Directions',
          colour: '#e67e22',
          contents: [{ kind: 'block', type: 'direction_constant' }]
        }
      ]
    };

    // Inject the Blockly workspace into the DOM element
    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3.0,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true
      }
    });

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <div 
        ref={blocklyDiv} 
        style={{ width: '850px', height: '480px', borderRadius: '8px', overflow: 'hidden' }} 
      />
    </div>
  );
}