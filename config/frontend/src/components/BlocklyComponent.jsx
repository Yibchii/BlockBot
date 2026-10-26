import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import '../IntegerConstantBlock';
import '../coreBlocks';
import '../blockGen';
import '../generators/mazeBotGenerators';


export default function BlocklyComponent({ onWorkspaceReady }) {
  const readyCallbackRef = useRef(onWorkspaceReady);
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    readyCallbackRef.current = onWorkspaceReady;
  }, [onWorkspaceReady]);

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
              type: 'start_program'
            },
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
              type: 'controls_repeat_ext',
              inputs: {
                TIMES: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 10
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'controls_whileUntil'
            },
            {
              kind: 'block',
              type: 'controls_for',
              inputs: {
                FROM: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                },
                TO: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 10
                    }
                  }
                },
                BY: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                }
              }
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
              type: 'math_arithmetic',
              inputs: {
                A: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                },
                B: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_single',
              inputs: {
                NUM: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 9
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_trig',
              inputs: {
                NUM: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 45
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_constant'
            },
            {
              kind: 'block',
              type: 'math_number_property',
              inputs: {
                NUMBER_TO_CHECK: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 0
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_round',
              inputs: {
                NUM: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 3.1
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_on_list'
            },
            {
              kind: 'block',
              type: 'math_modulo',
              inputs: {
                DIVIDEND: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 64
                    }
                  }
                },
                DIVISOR: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 10
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_constrain',
              inputs: {
                VALUE: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 50
                    }
                  }
                },
                LOW: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                },
                HIGH: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 100
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'math_random_int',
              inputs: {
                FROM: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                },
                TO: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 100
                    }
                  }
                }
              }
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
            {
              kind: 'block',
              type: 'text'
            },
            {
              kind: 'block',
              type: 'text_join'
            },
            {
              kind: 'block',
              type: 'text_append',
              inputs: {
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: ''
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_length',
              inputs: {
                VALUE: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_isEmpty',
              inputs: {
                VALUE: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: ''
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_indexOf',
              inputs: {
                VALUE: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                },
                FIND: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'b'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_charAt',
              inputs: {
                VALUE: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_getSubstring',
              inputs: {
                STRING: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_changeCase',
              inputs: {
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_trim',
              inputs: {
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_count',
              inputs: {
                SUB: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'a'
                    }
                  }
                },
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'banana'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_replace',
              inputs: {
                FROM: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'm'
                    }
                  }
                },
                TO: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'w'
                    }
                  }
                },
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'mom'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_reverse',
              inputs: {
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_print',
              inputs: {
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'text_prompt_ext',
              inputs: {
                TEXT: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'abc'
                    }
                  }
                }
              }
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
              type: 'lists_repeat',
              inputs: {
                NUM: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 5
                    }
                  }
                }
              }
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
              type: 'lists_indexOf',
              inputs: {
                VALUE: {
                  block: {
                    type: 'variables_get',
                    fields: {
                      VAR: {
                        id: 'i'
                      }
                    }
                  }
                },
                FIND: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: 'item'
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'lists_getIndex',
              inputs: {
                VALUE: {
                  block: {
                    type: 'variables_get',
                    fields: {
                      VAR: {
                        id: 'i'
                      }
                    }
                  }
                },
                AT: {
                  block: {
                    type: 'math_number',
                    fields: {
                      NUM: 1
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'lists_setIndex',
            },
            {
              kind: 'block',
              type: 'lists_getSublist',
              inputs: {
                LIST: {
                  block: {
                    type: 'variables_get',
                    fields: {
                      VAR: {
                        id: 'i'
                      }
                    }
                  }
                },
              }
            },
            {
              kind: 'block',
              type: 'lists_split',
              inputs: {
                DELIM: {
                  block: {
                    type: 'text',
                    fields: {
                      TEXT: ','
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'lists_sort',
              inputs: {
                LIST: {
                  block: {
                    type: 'variables_get',
                    fields: {
                      VAR: {
                        id: 'i'
                      }
                    }
                  }
                }
              }
            },
            {
              kind: 'block',
              type: 'lists_reverse',
              inputs: {
                LIST: {
                  block: {
                    type: 'variables_get',
                    fields: {
                      VAR: {
                        id: 'i'
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        {
          kind: 'category',
          name: 'Variables',
          colour: '#a55b80',
          custom: 'VARIABLE'
        },
        {
          kind: 'category',
          name: 'Functions',
          colour: '#995ba5',
          contents: [
            {
              kind: 'block',
              type: 'procedures_defnoreturn',
              fields: {
                NAME: 'do something'
              }
            },
            {
              kind: 'block',
              type: 'procedures_defreturn',
              fields: {
                NAME: 'do something'
              }
            },
            {
              kind: 'block',
              type: 'procedures_ifreturn'
            },
          ]
        },
        {
          kind: 'category',
          name: 'Robot',
          colour: '#e67e22',
          contents: [
            {
              kind: 'block',
              type: 'mazebot2d_move'
            },
            {
              kind: 'block',
              type: 'mazebot2d_can_move'
            },
            {
              kind: 'block',
              type: 'direction_constant'
            },
            {
              kind: 'block',
              type: 'mazebot2d_on_goal'
            }
          ]
        }
      ]
    };

    // Inject the Blockly workspace into the DOM element
    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox,
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

    // using blocky's built-in dynamic variables category
    ['i', 'j', 'k', 'm', 'n', 'o'].forEach((name) => {
      workspaceRef.current.getVariableMap().createVariable(name);
    });

    // Replace variable-name placeholders with the IDs required by Blockly.
    const resolvedToolbox = JSON.parse(JSON.stringify(toolbox));
    const variableMap = workspaceRef.current.getVariableMap();

    const resolveVariableIds = (value) => {
      if (Array.isArray(value)) {
        value.forEach(resolveVariableIds);
        return;
      }

      if (!value || typeof value !== 'object') return;

      if (value.VAR?.id) {
        const variable = variableMap.getVariable(value.VAR.id);
        if (variable) {
          value.VAR = {
            id: variable.getId(),
            name: variable.getName(),
            type: variable.getType(),
          };
        }
      }

      Object.values(value).forEach(resolveVariableIds);
    };

    resolveVariableIds(resolvedToolbox);
    workspaceRef.current.updateToolbox(resolvedToolbox);

    const workspace = workspaceRef.current;
    readyCallbackRef.current?.(workspace);

    // Blocky needs resizing when its flex/grid parent changes size
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => Blockly.svgResize(workspace)) : null;
    observer?.observe(blocklyDiv.current);
    Blockly.svgResize(workspace);

    return () => {
      observer?.disconnect();
      readyCallbackRef.current?.(null);
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  return (
    <div ref={blocklyDiv} className="blockly-host" aria-label="Blockly programming canvas" />
  );
}
