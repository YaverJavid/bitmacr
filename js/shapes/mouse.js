paintZone.addEventListener('mousedown', (event) => {
    if (["none", "stroke"].includes(paintModeSelector.value)) return;
    const x = event.clientX;
    const y = event.clientY;
    const currentCellIndex = Array.from(cells).indexOf(document.elementFromPoint(x, y));
    startingCoords.gridX = Math.floor(currentCellIndex / cols);
    startingCoords.gridY = currentCellIndex % cols;
    startingCoords.x = x;
    startingCoords.y = y;
    if (paintModeSelector.value == "line" && connectLastLineLocation.checked && lineLastCoords != {}) {
        let cells2d = [];
        for (let i = 0; i < cells.length; i++)
            cells2d.push(cells[i]);
        cells2d = toPaintData2D(cells2d);
        drawLine(cells2d, lineLastCoords.x, lineLastCoords.y, startingCoords.gridY, startingCoords.gridX);
        recordPaintData();
    } else if (paintModeSelector.value == "line-stroke") {
        isStartOfLineStroke = true;
    }
});

function refillCanvas() {
    for (let i = 0; i < cells.length; i++) cells[i].style.backgroundColor = buffer.getItem()[i];
}

paintZone.addEventListener('mousemove', (event) => {
    if (event.buttons !== 1 || paintModeSelector.value == "none") return
    event.preventDefault();
    const x = event.clientX;
    const y = event.clientY;
    let currentCell = document.elementFromPoint(x, y);
    let cellIndex = currentCell.index
    const currentGridY = Math.floor(cellIndex / cols);
    const currentGridX = cellIndex % cols
    if (paintModeSelector.value != "line-stroke") refillCanvas()
    const paintZoneWidth = window.getComputedStyle(paintZone).getPropertyValue("width");
    const cw = parseFloat(paintZoneWidth) / cols
    let dx = -1 * Math.ceil((startingCoords.x - x) / cw) + 1
    let dy = Math.ceil((startingCoords.y - y) / cw)
    if (dx < 1) dx = 1
    if (dy < 1) dy = 1

    draw(event, currentGridX, currentGridY, startingCoords.x, startingCoords.y, startingCoords.gridX, startingCoords.gridY, dx, dy, currentCell, cw, x, y)
});


function handleMousePaintEnd(event) {
    shapeInfoShower.textContent = ''
    if (paintModeSelector.value == "selecting") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        if (!copy().failed) updateSelectionUI()
    } else if (paintModeSelector.value == "zoom") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        if (zoomedIn) return
        zoomOriginY = selectionCoords.ybr
        zoomOriginX = selectionCoords.xbr
        fullCols = cols
        fullRows = rows
        if (!copy('zoom').failed) {
            zoomedIn = true
            originalSnapshot = JSON.stringify(buffer)
            applySelectedPartSilent(zoomedPart)
            recordPaintData()
            id("top-zoom-out").style.border = "3px solid var(--primary)"
            for (let i = 0; i < zoomOutButtons.length; i++) {
                zoomOutButtons[i].style.cursor = "zoom-out"
            }

        }
    }
    else if (paintModeSelector.value == "flip") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        let by = selectionCoords.ybr
        let bx = selectionCoords.xbr
        if (!copy('flip').failed) {
            let cells2d = [];
            for (let i = 0; i < cells.length; i++) cells2d.push(cells[i])
            cells2d = toPaintData2D(cells2d);
            if (id("flipper-direction").value == "horizontal") for (let i = 0; i < partToFlip.length; i++) partToFlip[i].reverse()
            else partToFlip.reverse()
            paste(bx, by, partToFlip, cells2d)
            recordPaintData()
        }
    } else if (paintModeSelector.value == "line") {
        let x = event.clientX;
        let y = event.clientY;
        currentCellIndex = Array.from(cells).indexOf(document.elementFromPoint(x, y));
        lineLastCoords.x = currentCellIndex % cols;
        lineLastCoords.y = Math.floor(currentCellIndex / cols);
    }
    alreadyFilledLinePoints = new Set()
    if (paintModeSelector.value != "none") recordPaintData();
}

paintZone.onmouseleave = (event) => {
    if (event.buttons !== 1) return
    handleMousePaintEnd(event)
}
paintZone.addEventListener('mouseup', handleMousePaintEnd)
