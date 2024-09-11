paintZone.addEventListener('mousedown', (event) => {
    if (["none", "stroke"].includes(paintModeSelector.value)) return;
    const x = event.clientX;
    const y = event.clientY;
    const currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y));
    startingCoords.gridX = Math.floor(currentCellIndex / cols);
    startingCoords.gridY = currentCellIndex % cols;
    startingCoords.x = x;
    startingCoords.y = y;

    if (paintModeSelector.value == "line" && connectLastLineLocation.checked && lineLastCoords != {}) {
        let paintCells2d = [];
        for (let i = 0; i < paintCells.length; i++)
            paintCells2d.push(paintCells[i]);
        paintCells2d = toPaintData2D(paintCells2d);
        drawLine(paintCells2d, lineLastCoords.x, lineLastCoords.y, startingCoords.gridY, startingCoords.gridX);
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
    let paintCells2d = [];
    if (paintModeSelector.value != "line-stroke") {
        for (let i = 0; i < paintCells.length; i++) {
            paintCells[i].style.backgroundColor = buffer.getItem()[i];
        }
    }
    for (let i = 0; i < paintCells.length; i++) {
        paintCells2d.push(paintCells[i]);
    }
    paintCells2d = toPaintData2D(paintCells2d);
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
        case "zoom":
        case "selecting":
            if (paintModeSelector.value == "zoom" && zoomedIn) break
            let paintZonePosition = paintZone.getBoundingClientRect()
            let correctedStartingY = startingCoords.y - paintZonePosition.y
            let correctedStartingX = startingCoords.x - paintZonePosition.x

            handleSelectionShowerVisibility(
                // 1 is border width of self
                (currentGridY - startingCoords.gridX) * cw - 1 + "px",
                (currentGridX - startingCoords.gridY) * cw - 1 + "px",
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
            paste(px, py, selectedPart, paintCells2d)
            break;
        case "eq-triangle":
            drawEquilateralTriangle(startingCoords.gridX, startingCoords.gridY, 6, paintCells2d)
            break;
        case 'circle':
            if (fixedRadius.checked) radius = parseInt(fixedRadiusValue.value)
            let circleX, circleY
            if (fixedRadius.checked) {
                circleX = currentGridX
                circleY = currentGridY
            } else {
                circleX = startingCoords.gridX - radius
                circleY = startingCoords.gridY + radius
            }
            if (circleAlgorithm.value == "accurate") {
                drawCircle(circleX, circleY, radius, paintCells2d, fillCircle.checked)
            } else if (circleAlgorithm.value == "natural") {
                if (fillCircle.checked) drawNaturalFilledCircle(circleX, circleY, radius, paintCells2d)
                else drawNaturalStrokeCircle(circleX, circleY, radius, paintCells2d)
            }
            break;
        case "triangle":
            drawEquilateralTriangle(startingCoords.gridY, startingCoords.gridX, paintCells2d, Math.abs(startingCoords.gridY - currentGridY), parseInt(id("change-per-col").value), { allOn: id("all-changes-on").value })
            break;
        case 'sphere':
            drawSphere(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, paintCells2d)
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
            drawRectangle(bx, by, w, h, paintCells2d, fillRect.checked)
            break
        case 'line':
            if (currentCell.classList[0] != "cell") return
            drawLine(paintCells2d, startingCoords.gridY, startingCoords.gridX, currentGridX, currentGridY)
            break
        case 'line-stroke':
            if (currentCell.classList[0] != "cell") return
            if (isStartOfLineStroke)
                drawLine(paintCells2d, startingCoords.gridY, startingCoords.gridX, currentGridX, currentGridY)
            else
                drawLine(paintCells2d, lastLineStrokeEndingCoords.gridX, lastLineStrokeEndingCoords.gridY, currentGridX, currentGridY)
            isStartOfLineStroke = false
            lastLineStrokeEndingCoords.gridY = currentGridY
            lastLineStrokeEndingCoords.gridX = currentGridX
            break
    }
});

function handleMousePaintEnd(event) {
    if (paintModeSelector.value == "selecting") {
        if (!selectionCoords) return;
        handleSelectionShowerVisibility("0", "0", "0", "0", "0");
        copy();
        updateSelectionUI()
    } else if (paintModeSelector.value == "zoom") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        if (zoomedIn) return
        zoomOriginY = selectionCoords.ybr
        zoomOriginX = selectionCoords.xbr
        fullCols = cols
        fullRows = rows
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
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
    } else if (paintModeSelector.value == "line") {
        let x = event.clientX;
        let y = event.clientY;
        currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y));
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
