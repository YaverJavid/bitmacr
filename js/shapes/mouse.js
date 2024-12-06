paintZone.addEventListener('mousedown', (event) => {
    alreadyFilledLinePoints = new Set()
    if (["none", "stroke"].includes(paintModeSelector.value)) return;
    const x = event.clientX;
    const y = event.clientY;
    const currentCellIndex = Array.from(cells).indexOf(document.elementFromPoint(x, y));
    startingCoords.gridX = currentCellIndex % cols;
    startingCoords.gridY = Math.floor(currentCellIndex / cols);
    startingCoords.x = x;
    startingCoords.y = y;
    if (paintModeSelector.value == "line" && connectLastLineLocation.checked && lineLastCoords != {}) {
        let cells2d = [];
        for (let i = 0; i < cells.length; i++)
            cells2d.push(cells[i]);
        cells2d = toPaintData2D(cells2d);
        drawLine(cells2d, lineLastCoords.x, lineLastCoords.y, startingCoords.gridY, startingCoords.gridX, id('line-width').value, id('line-cap').value, id("allow-line-doubles").checked);
        recordPaintData();
    } else if (paintModeSelector.value == "line-stroke") {
        isStartOfLineStroke = true;
    } else if (paintModeSelector.value == 'pen-fill') {
        penFillBuffer = toPaintData2D(buffer.getItem().slice())
        penFloodFillCoordsVisited = new Set()
    }
});


paintZone.addEventListener('mousemove', (event) => {
    if (event.buttons !== 1 || paintModeSelector.value == "none") return
    event.preventDefault();
    const x = event.clientX;
    const y = event.clientY;
    if (!["line-stroke", "pen-fill"].includes(paintModeSelector.value)) refillCanvas()
    draw(event, x, y, startingCoords.x, startingCoords.y, startingCoords.gridX, startingCoords.gridY)
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
            paste(bx, by, partToFlip, cells2d, 'flip')
            recordPaintData()
        }
    } else if (paintModeSelector.value == "line") {
        let x = event.clientX;
        let y = event.clientY;
        currentCellIndex = Array.from(cells).indexOf(document.elementFromPoint(x, y));
        lineLastCoords.x = currentCellIndex % cols;
        lineLastCoords.y = Math.floor(currentCellIndex / cols);
    }
    if (paintModeSelector.value != "none") recordPaintData();
}

paintZone.onmouseleave = (event) => {
    if (event.buttons !== 1) return
    handleMousePaintEnd(event)
}
paintZone.addEventListener('mouseup', handleMousePaintEnd)
