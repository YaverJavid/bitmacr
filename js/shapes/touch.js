let wasLastTouchStart = false

paintZone.addEventListener('touchstart', (event) => {
    wasLastTouchStart = true
    const { targetTouches } = event;
    const touch = targetTouches[0];
    if (["none", "stroke"].includes(paintModeSelector.value)) return
    const x = touch.clientX;
    const y = touch.clientY;
    const currentCellIndex = document.elementFromPoint(x, y).index
    startingCoords.gridX = Math.floor(currentCellIndex / cols);
    startingCoords.gridY = currentCellIndex % cols
    startingCoords.x = x
    startingCoords.y = y
    if (paintModeSelector.value == "line" && connectLastLineLocation.checked && lineLastCoords != {}) {
        let cells2D = []
        for (let i = 0; i < cells.length; i++)
            cells2D.push(cells[i])
        cells2D = toPaintData2D(cells2D)
        drawLine(cells2D, lineLastCoords.x, lineLastCoords.y, startingCoords.gridY, startingCoords.gridX)
        recordPaintData()
    }
    else if (paintModeSelector.value == "line-stroke") isStartOfLineStroke = true
})

const paintZoneHeight = window.getComputedStyle(paintZone).getPropertyValue("height")
paintZone.addEventListener('touchmove', (event) => {
    if (wasLastTouchStart) {
        wasLastTouchStart = false
        if (event.touches.length == 3) {
            if (buffer.setPointer(buffer.pointer - 1))
                applyPaintData(buffer.getItem())
            return
        }
    }
    if (event.touches.length != 1 || paintModeSelector.value == "none") return
    const { targetTouches } = event;
    const touch = targetTouches[0];
    const x = touch.clientX
    const y = touch.clientY
    let cells2d = []
    if (paintModeSelector.value != "line-stroke") {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = buffer.getItem()[i]
        }
    }
    for (let i = 0; i < cells.length; i++) {
        cells2d.push(cells[i])
    }
    cells2d = toPaintData2D(cells2d)
    const paintZoneWidth = window.getComputedStyle(paintZone).getPropertyValue("width")
    const cw = (parseFloat(paintZoneWidth) / cols)
    let dx = Math.ceil(Math.abs(startingCoords.x - x) / cw)
    let dy = Math.ceil(Math.abs(startingCoords.y - y) / cw)
    let currentCell = document.elementFromPoint(x, y);
    let currentGridY, currentGridX, currentCellIndex = currentCell.index
    let radius = dx
    event.preventDefault()
    switch (paintModeSelector.value) {
        case "zoom":
        case "flip":
        case "selecting":
            if (paintModeSelector.value == "zoom" && zoomedIn) break
            let paintZonePosition = paintZone.getBoundingClientRect()
            let correctedStartingY = startingCoords.y - paintZonePosition.y
            let correctedStartingX = startingCoords.x - paintZonePosition.x
            handleSelectionShowerVisibility(
                // 1 is border width of self
                ((currentGridY - startingCoords.gridX + 1) * cw - 1) + "px",
                ((currentGridX - startingCoords.gridY + 1) * cw - 1) + "px",
                (correctedStartingY - (correctedStartingY % cw)) + "px",
                (correctedStartingX - (correctedStartingX % cw)) + "px",
                "1px"
            )
            selectionCoords = {
                ytl: Math.min(Math.max(startingCoords.gridX, 0), rows),
                xtl: Math.min(Math.max(startingCoords.gridY, 0), cols),
                ybr: Math.min(currentGridY + 1, rows),
                xbr: Math.min(currentGridX + 1, cols)
            }
            break
        case "paste":
            if (!selectedPart) return
            if (currentCell.classList[0] != "cell") return
            currentGridY = Math.floor(currentCellIndex / cols)
            currentGridX = currentCellIndex % cols
            paste(
                currentGridX + selectedPart[0].length,
                currentGridY + selectedPart.length,
                selectedPart,
                cells2d
            )
            break;
        case 'circle':
            if (fixedRadius.checked) radius = parseInt(fixedRadiusValue.value)
            let circleX, circleY
            if (fixedRadius.checked) {
                circleX = Math.floor(currentCellIndex / cols);
                circleY = currentCellIndex % cols
            } else {
                circleX = startingCoords.gridX - radius
                circleY = startingCoords.gridY + radius
            }
            if (circleAlgorithm.value == "accurate") {
                drawCircle(circleX, circleY, radius, cells2d, fillCircle.checked)
            } else if (circleAlgorithm.value == "natural") {
                drawNaturalCircle(circleX, circleY, radius, cells2d, fillCircle.checked)
            }
            break;
        case "triangle":
            let ty = currentCellIndex % cols
            drawEquilateralTriangle(startingCoords.gridY, startingCoords.gridX, cells2d, Math.abs(startingCoords.gridY - ty), parseInt(id("change-per-col").value), { allOn: id("all-changes-on").value })
            break;
        case 'sphere':
            drawSphere(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, cells2d)
            break;
        case 'rect':
            let bx, by, h, w
            if (fixedRectSize.checked) {
                bx = currentCellIndex % cols
                by = Math.floor(currentCellIndex / cols);
                w = parseInt(fixedRectWidth.value)
                h = parseInt(fixedRectHeight.value)
            } else {
                bx = startingCoords.gridY
                by = startingCoords.gridX
                w = dx
                h = dy
            }
            drawRectangle(bx, by, w, h, cells2d, fillRect.checked)
            break
        case 'line':
            if (currentCell.classList[0] != "cell") return
            currentCellIndex = document.elementFromPoint(x, y).index
            currentGridX = Math.floor(currentCellIndex / cols);
            currentGridY = currentCellIndex % cols
            drawLine(cells2d, startingCoords.gridY, startingCoords.gridX, currentGridY, currentGridX, id('line-width').value, id('line-cap').value, id("allow-line-doubles").checked)
            alreadyFilledLinePoints = new Set()
            break
        case 'curve':
            if (currentCell.classList[0] != "cell") return
            currentGridY = Math.floor(currentCellIndex / cols);
            currentGridX = currentCellIndex % cols
            let curvature = Number(id("curvature").value)
            curvature += Number(id("curve-depth").value) * (Math.sign(curvature) || 1)
            drawCurve(cells2d, startingCoords.gridY, startingCoords.gridX, currentGridX, currentGridY, id('curve-line-width').value, id('curve-line-cap').value, curvature, id('curve-origin').value, id("curve-steps").value)
            alreadyFilledLinePoints = new Set()
            break
        case 'line-stroke':
            if (currentCell.classList[0] != "cell") return
            currentGridX = Math.floor(currentCellIndex / cols)
            currentGridY = currentCellIndex % cols
            if (isStartOfLineStroke)
                drawLine(cells2d, startingCoords.gridY, startingCoords.gridX, currentGridY, currentGridX, id('stroke-line-width').value, id("stroke-line-cap").value, id("allow-line-stroke-doubles").checked)
            else
                drawLine(cells2d, lastLineStrokeEndingCoords.gridY, lastLineStrokeEndingCoords.gridX, currentGridY, currentGridX, id('stroke-line-width').value, id("stroke-line-cap").value, id("allow-line-stroke-doubles").checked)
            isStartOfLineStroke = false
            lastLineStrokeEndingCoords.gridX = currentGridX
            lastLineStrokeEndingCoords.gridY = currentGridY
            break
    }
});

paintZone.addEventListener('touchend', (event) => {
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
        if (!copy(zoom = true).failed) {
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
            paste(bx, by, partToFlip, cells2d)
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
    alreadyFilledLinePoints = new Set()
})
