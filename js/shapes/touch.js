let wasLastTouchStart = false

paintZone.addEventListener('touchstart', (event) => {
    alreadyFilledLinePoints = new Set()
    wasLastTouchStart = true
    const { targetTouches } = event;
    const touch = targetTouches[0];
    if (["none", "stroke"].includes(paintModeSelector.value)) return
    const x = touch.clientX;
    const y = touch.clientY;
    const currentCellIndex = document.elementFromPoint(x, y).index
    startingCoords.gridX = currentCellIndex % cols;
    startingCoords.gridY =  Math.floor(currentCellIndex / cols)
    startingCoords.x = x
    startingCoords.y = y
    if (paintModeSelector.value === "line" && connectLastLineLocation.checked && lineLastCoords != {}) {
        let cells2D = []
        for (let i = 0; i < cells.length; i++)
            cells2D.push(cells[i])
        cells2D = toPaintData2D(cells2D)
        drawLine(cells2D, lineLastCoords.x, lineLastCoords.y, startingCoords.gridY, startingCoords.gridX)
        recordPaintData()
    }
    else if (paintModeSelector.value === "line-stroke") isStartOfLineStroke = true
    else if (paintModeSelector.value == 'pen-fill') {
        penFillBuffer = toPaintData2D(buffer.getItem().slice())
        penFloodFillCoordsVisited = new Set()
    }
})

const paintZoneHeight = window.getComputedStyle(paintZone).getPropertyValue("height")

paintZone.addEventListener('touchmove', (event) => {
    if (wasLastTouchStart) {
        wasLastTouchStart = false
        if (event.touches.length === 3) return undo()
    }
    event.preventDefault();
    if (event.touches.length != 1 || paintModeSelector.value == "none") return
    const { targetTouches } = event;
    const touch = targetTouches[0];
    const x = touch.clientX
    const y = touch.clientY
    if (!["line-stroke", "pen-fill"].includes(paintModeSelector.value)) refillCanvas()
    draw(event, x, y, startingCoords.x, startingCoords.y, startingCoords.gridX, startingCoords.gridY)
});


paintZone.addEventListener('touchend', (event) => {
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
    } else if (paintModeSelector.value == "flip") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        let by = selectionCoords.ybr
        let bx = selectionCoords.xbr
        if (!copy('flip').failed) {
            let cells2d = [];
            for (let i = 0; i < cells.length; i++) cells2d.push(cells[i])
            cells2d = toPaintData2D(cells2d);
            for (let i = 0; i < partToFlip.length; i++) partToFlip[i].reverse()
            paste(bx, by, partToFlip, cells2d, 'flip')
            recordPaintData()
        }
    }
    else if (paintModeSelector.value == "line") {
        let x = event.changedTouches[event.changedTouches.length - 1].clientX
        let y = event.changedTouches[event.changedTouches.length - 1].clientY
        currentCellIndex = document.elementFromPoint(x, y).index
        lineLastCoords.x = currentCellIndex % cols
        lineLastCoords.y = Math.floor(currentCellIndex / cols);
    }
    if (paintModeSelector.value != "none") recordPaintData()
})
