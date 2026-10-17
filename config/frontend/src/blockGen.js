import * as Blockly from 'blockly';

// Fetch a block definition file from the API and register its blocks with Blockly.
export async function loadBlocksFromApi(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load blocks from ${url}: ${response.status}`);
  }

  const data = await response.json();
  const definitions = data.blocks?.blocks ?? [];

  // Skip blocks that are already registered
  const newDefinitions = definitions.filter((def) => !Blockly.Blocks[def.type]);
  Blockly.common.defineBlocksWithJsonArray(newDefinitions);

  return data;
}

// Runs once when this file is first imported. Any file that imports this one
// (BlocklyComponent.jsx so far) waits for this to finish, so the blocks are
// always defined before the workspace is created.
try {
  await loadBlocksFromApi('/api/mazebot2d/blocks');
} catch (error) {
  console.error('Error loading Mazebot2D blocks:', error);
}

export function generateSimulatorCommands(workspace) {
    const commands = [];
    const topBlocks = workspace.getTopBlocks(true);

    for (const block of topBlocks) {
        let current = block;
        while (current) {
            switch (current.type) {
                case 'maze_move_forward':
                    commands.push({ type: 'FORWARD', value: 50 });
                    break;
                case 'maze_turn_left':
                    commands.push({ type: 'TURN_LEFT', value: 90 });
                    break;
                case 'maze_turn_right':
                    commands.push({ type: 'TURN_RIGHT', value: 90 });
                    break;
                default:
                    break;
            }
            current = current.getNextBlock();
        }
    }
    return commands;
}