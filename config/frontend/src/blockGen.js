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
