export function getBotResponse(message) {
  const input = message.toLowerCase();

  if (input.includes("turn")) {
    return "To turn your robot, use the Turn left or Turn Right block from the toolbox!";
  }

  if (input.includes("move") || input.includes("forward")) {
    return "Try using the Move Forward block to make your robot move!";
  }

  if (input.includes("loop") || input.includes("repeat")) {
    return "Loops help you repeat actions! Try placing a movement block inside a Repeat block.";
  }

  if (input.includes("maze") || input.includes("obstacle")) {
    return "Try breaking the maze into smaller steps. Plan your robot's path before adding blocks!";
  }

  if (input.includes("run") || input.includes("start")) {
    return "Click the Run button to execute your blocks and watch your robot move!";
  }

  return "I'm here to help! Try asking about movement, turning, loops, or solving mazes.";
}
