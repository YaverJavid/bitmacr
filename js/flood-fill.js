function floodFill(a2d, x, y, color = false) {
    return floodFillWithCoords(a2d, x, y, color)[0]
}

function floodFillWithCoords(a2d, x, y, color = false) {
    if (color) color = cssToRGBAOrRgb(color)
    const xLength = a2d[0].length;
    const yLength = a2d.length;
    const currentColor = cssToRGBAOrRgb(a2d[y][x]);

    const queue = [[x, y]];
    let visited = new Set();
    a2d[y][x] = color ? color : cssToRGBAOrRgb(getCurrentSelectedColor())

    while (queue.length > 0) {
        const [currentX, currentY] = queue.shift();
        if (visited.has(`${currentX}-${currentY}`)) continue
        visited.add(`${currentX}-${currentY}`);
        const neighbors = [
            [currentX - 1, currentY],
            [currentX + 1, currentY],
            [currentX, currentY - 1],
            [currentX, currentY + 1],
        ];

        for (const [neighborX, neighborY] of neighbors) {
            if (isInBounds(neighborX, neighborY, xLength, yLength) && !visited.has(`${neighborX}-${neighborY}`) && a2d[neighborY][neighborX] === currentColor) {
                a2d[neighborY][neighborX] = color ? color : cssToRGBAOrRgb(getCurrentSelectedColor())
                queue.push([neighborX, neighborY]);
            }
        }
    }
    return [a2d, visited];
}


id('flood-fill-with-one-color').oninput = () => {
    id('flood-fill-button').src = 'icons/fill-mode/' + (id('flood-fill-with-one-color').checked ? 'fill-1.png' : 'fill.png')

    
    id('cm-click-mode-fill').src = 'icons/fill-mode/' + (id('flood-fill-with-one-color').checked ? 'fill-1.png' : 'fill.png')
}