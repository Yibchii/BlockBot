import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';

export default function BlocklyComponent() {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Define basic toolbox categories
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
          contents: [{ kind: 'block', type: 'lists_create_with' }]
        }
      ]
    };

    // Inject the Blockly workspace into the DOM element
    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true
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