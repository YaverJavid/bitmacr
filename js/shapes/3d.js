function drawCuboid(matrix, tx, ty, width, height, depth, rotationX, rotationY, rotationZ) {
    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180;
    const radZ = (rotationZ * Math.PI) / 180;

    function rotate(x, y, z, cx, cy, cz) {
        let nx = x - cx, ny = y - cy, nz = z - cz;

        let rzX = nx * Math.cos(radZ) - ny * Math.sin(radZ);
        let rzY = nx * Math.sin(radZ) + ny * Math.cos(radZ);
        nx = rzX; ny = rzY;

        let rxY = ny * Math.cos(radX) - nz * Math.sin(radX);
        let rxZ = ny * Math.sin(radX) + nz * Math.cos(radX);
        ny = rxY; nz = rxZ;

        let ryX = nz * Math.sin(radY) + nx * Math.cos(radY);
        let ryZ = nz * Math.cos(radY) - nx * Math.sin(radY);
        nx = ryX; nz = ryZ;

        return [nx + cx, ny + cy, nz + cz];
    }

    let vertices = [
        [0, 0, 0], [width, 0, 0], [width, height, 0], [0, height, 0],
        [0, 0, -depth], [width, 0, -depth], [width, height, -depth], [0, height, -depth]
    ];

    let centerX = tx + width / 2, centerY = ty + height / 2, centerZ = -depth / 2;

    vertices = vertices.map(([x, y, z]) => rotate(x + tx, y + ty, z, centerX, centerY, centerZ));

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    for (const [start, end] of edges) {
        const [x1, y1] = vertices[start];
        const [x2, y2] = vertices[end];

        drawSimpleLine(matrix, Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2));
    }
}


function visualiseCuboid() {
    refillCanvas()
    let paddingTB = Math.floor(rows * 0.2)
    let paddingLR = Math.floor(cols * 0.2)
    drawCuboid(cells2d, paddingTB, paddingLR, valueAsNumber('cuboid-width'), valueAsNumber('cuboid-height'), valueAsNumber('cuboid-breadth'), valueAsNumber('cuboid-rotation-x'), valueAsNumber('cuboid-rotation-y'), valueAsNumber('cuboid-rotation-z'))
}

attachInputListener('cuboid-rotation-x', visualiseCuboid, '&deg;')
id('cuboid-rotation-x').onmouseup = refillCanvas
id('cuboid-rotation-x').ontouchend = refillCanvas

attachInputListener('cuboid-rotation-y', visualiseCuboid, '&deg;')
id('cuboid-rotation-y').onmouseup = refillCanvas
id('cuboid-rotation-y').ontouchend = refillCanvas


attachInputListener('cuboid-rotation-z', visualiseCuboid, '&deg;')
id('cuboid-rotation-z').onmouseup = refillCanvas
id('cuboid-rotation-z').ontouchend = refillCanvas



attachInputListener('cuboid-height', visualiseCuboid, '');
setUpVariableRange(id('cuboid-height'));
id('cuboid-height').onmouseup = refillCanvas
id('cuboid-height').ontouchend = refillCanvas


attachInputListener('cuboid-width', visualiseCuboid, '');
setUpVariableRange(id('cuboid-width'));
id('cuboid-width').onmouseup = refillCanvas
id('cuboid-width').ontouchend = refillCanvas

attachInputListener('cuboid-breadth', visualiseCuboid, '');
setUpVariableRange(id('cuboid-breadth'));
id('cuboid-breadth').onmouseup = refillCanvas
id('cuboid-breadth').ontouchend = refillCanvas
