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
          contents: [{ kind: 'block', type: 'controls_if' }]
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#5ba55b',
          contents: [{ kind: 'block', type: 'controls_repeat_ext' }]
        },
        {
          kind: 'category',
          name: 'Math',
          colour: '#5b67a5',
          contents: [{ kind: 'block', type: 'math_number' }]
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