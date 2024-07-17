function floodFill(a2d, x, y) {
    const xLength = a2d[0].length;
    const yLength = a2d.length;
    const currentColor = a2d[y][x];

    const queue = [[x, y]]; // Use a queue for iterative approach
    let visited = new Set(); // Keep track of visited cells

    while (queue.length > 0) {
      const [currentX, currentY] = queue.shift();
      visited.add(`${currentX}-${currentY}`); // Mark current cell as visited

      // Check and update adjacent cells if within bounds and same color
      const neighbors = [
        [currentX - 1, currentY],
        [currentX + 1, currentY],
        [currentX, currentY - 1],
        [currentX, currentY + 1],
      ];

      for (const [neighborX, neighborY] of neighbors) {
        if (isInBounds(neighborX, neighborY, xLength, yLength) &&
            !visited.has(`${neighborX}-${neighborY}`) &&
            a2d[neighborY][neighborX] === currentColor) {
          a2d[neighborY][neighborX] = getCurrentSelectedColor();
          queue.push([neighborX, neighborY]);
        }
      }
    }
    a2d[y][x] = getCurrentSelectedColor()
    return a2d;
  }

  function isInBounds(x, y, xLength, yLength) {
    return (x >= 0) && (x < xLength) && (y >= 0) && (y < yLength);
  }

