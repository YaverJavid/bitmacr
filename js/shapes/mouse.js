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

paintZone.addEventListener('mousemove', (event) => {
    if (event.buttons !== 1 || paintModeSelector.value == "none") return;
    const x = event.clientX;
    const y = event.clientY;
    let currentCell = document.elementFromPoint(x, y);
    let cells2d = [];
    if (paintModeSelector.value != "line-stroke") {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = buffer.getItem()[i];
        }
    }
    for (let i = 0; i < cells.length; i++) cells2d.push(cells[i]);
    cells2d = toPaintData2D(cells2d);
    event.preventDefault();
    const paintZoneWidth = window.getComputedStyle(paintZone).getPropertyValue("width");
    const cw = parseFloat(paintZoneWidth) / cols;
    let dx = -1 * Math.ceil((startingCoords.x - x) / cw) + 1;
    let dy = Math.ceil((startingCoords.y - y) / cw);
    if (dx < 1) dx = 1
    if (dy < 1) dy = 1
    let cellIndex = document.elementFromPoint(x, y).index
    let radius = dx;
    const currentGridY = Math.floor(cellIndex / cols);
    const currentGridX = cellIndex % cols
    switch (paintModeSelector.value) {
        case "flip":
        case "zoom":
        case "selecting":
            if (paintModeSelector.value == "zoom" && zoomedIn) break
            let paintZonePosition = paintZone.getBoundingClientRect()
            let correctedStartingY = startingCoords.y - paintZonePosition.y
            let correctedStartingX = startingCoords.x - paintZonePosition.x

            handleSelectionShowerVisibility(
                // 1 is border width of self
                ((currentGridY - startingCoords.gridX) * cw - 1) + "px",
                ((currentGridX - startingCoords.gridY) * cw - 1) + "px",
                (correctedStartingY - (correctedStartingY % cw)) + "px",
                (correctedStartingX - (correctedStartingX % cw)) + "px",
                "1px"
            )
            selectionCoords = {
                ytl: Math.min(Math.max(startingCoords.gridX, 0), rows),
                xtl: Math.min(Math.max(startingCoords.gridY, 0), cols),
                ybr: Math.min(currentGridY, rows + 1),
                xbr: Math.min(currentGridX, cols)
            }
            break
        case "paste":
            if (!selectedPart) return
            if (currentCell.classList[0] != "cell") return
            let py = Math.floor(cellIndex / cols) + selectedPart.length
            let px = (cellIndex % cols) + selectedPart[0].length
            paste(px, py, selectedPart, cells2d)
            break;
        case "eq-triangle":
            drawEquilateralTriangle(startingCoords.gridX, startingCoords.gridY, 6, cells2d)
            break;
        case 'circle':
            if (fixedRadius.checked) radius = parseInt(fixedRadiusValue.value)
            let circleX, circleY
            if (fixedRadius.checked) {
                circleX = currentGridY
                circleY = currentGridX
            } else {
                circleX = startingCoords.gridX - radius
                circleY = startingCoords.gridY + radius
            }
            if (circleAlgorithm.value == "accurate") {
                drawCircle(circleX, circleY, radius, cells2d, fillCircle.checked)
            } else if (circleAlgorithm.value == "natural") {
                if (fillCircle.checked) drawNaturalFilledCircle(circleX, circleY, radius, cells2d)
                else drawNaturalStrokeCircle(circleX, circleY, radius, cells2d)
            }
            break;
        case "triangle":
            drawEquilateralTriangle(startingCoords.gridY, startingCoords.gridX, cells2d, Math.abs(startingCoords.gridY - currentGridX), parseInt(id("change-per-col").value), { allOn: id("all-changes-on").value })
            break;
        case 'sphere':
            drawSphere(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, cells2d)
            break;
        case 'rect':
            let bx, by, h, w
            if (fixedRectSize.checked) {
                bx = currentGridX
                by = currentGridY
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
            drawLine(cells2d, startingCoords.gridY, startingCoords.gridX, currentGridX, currentGridY, id('line-width').value, id('line-cap').value, id("allow-line-doubles").checked)
            alreadyFilledLinePoints = new Set()
            break
        case 'curve':
            if (currentCell.classList[0] != "cell") return
            let curvature = Number(id("curvature").value)
            curvature += Number(id("curve-depth").value) * (Math.sign(curvature) || 1)
            drawCurve(cells2d, startingCoords.gridY, startingCoords.gridX, currentGridX, currentGridY, id('curve-line-width').value, id('curve-line-cap').value, curvature, id('curve-origin').value, id("curve-steps").value)
            alreadyFilledLinePoints = new Set()
            break
        case 'line-stroke':
            if (currentCell.classList[0] != "cell") return
            if (isStartOfLineStroke)
                drawLine(cells2d, startingCoords.gridY, startingCoords.gridX, currentGridX, currentGridY, id('stroke-line-width').value, id("stroke-line-cap").value, id("allow-line-stroke-doubles").checked)
            else
                drawLine(cells2d, lastLineStrokeEndingCoords.gridX, lastLineStrokeEndingCoords.gridY, currentGridX, currentGridY, id('stroke-line-width').value, id("stroke-line-cap").value,)
            isStartOfLineStroke = false
            lastLineStrokeEndingCoords.gridY = currentGridY
            lastLineStrokeEndingCoords.gridX = currentGridX
            break
    }
});

function handleMousePaintEnd(event) {
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
