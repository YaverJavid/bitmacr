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
    currentCell = document.elementFromPoint(x, y);

    if (!["stroke"].includes(paintModeSelector.value)) {
        let paintCells2d = [];
        if (paintModeSelector.value != "line-stroke") {
            for (let i = 0; i < paintCells.length; i++) {
                paintCells[i].style.background = buffer.getItem()[i];
            }
        }
        for (let i = 0; i < paintCells.length; i++) {
            paintCells2d.push(paintCells[i]);
        }
        paintCells2d = toPaintData2D(paintCells2d);
        event.preventDefault();
        const paintZoneWidth = window.getComputedStyle(paintZone).getPropertyValue("width");
        const cw = parseFloat(paintZoneWidth) / cols;
        let dx = Math.ceil(Math.abs(startingCoords.x - x) / cw);
        let dy = Math.ceil(Math.abs(startingCoords.y - y) / cw);

        let gridY, gridX, currentCellIndex;
        let radius = dx;

        switch (paintModeSelector.value) {
            case "zoom":
            case "selecting":
                paintZonePosition = paintZone.getBoundingClientRect()
                correctedStartingY = startingCoords.y - paintZonePosition.y
                correctedStartingX = startingCoords.x - paintZonePosition.x
                correctedX = x - paintZonePosition.x
                correctedY = y - paintZonePosition.y
                gridX = Math.floor(correctedX / cw)
                gridY = Math.floor(correctedY / cw)

                handleSelectionShowerVisibility(
                    // 1 is border width of self
                    (gridY - startingCoords.gridX) * cw - 1 + "px",
                    (gridX - startingCoords.gridY) * cw - 1 + "px",
                    (correctedStartingY - (correctedStartingY % cw)) + "px",
                    (correctedStartingX - (correctedStartingX % cw)) + "px",
                    "1px"
                )
                selectionCoords = {
                    ytl: Math.min(Math.max(startingCoords.gridX, 0), rows),
                    xtl: Math.min(Math.max(startingCoords.gridY, 0), cols),
                    ybr: Math.min(gridY, rows),
                    xbr: Math.min(gridX, cols)
                }
                break
            case "paste":
                if (!selectedPart) return
                paintZonePosition = paintZone.getBoundingClientRect()
                correctedX = x - paintZonePosition.x - pasteOffset
                correctedY = y - paintZonePosition.y - pasteOffset
                gridX = Math.floor(correctedX / cw)
                gridY = Math.floor(correctedY / cw)
                paste(
                    gridX + selectedPart.length,
                    gridY + selectedPart[0].length,
                    selectedPart,
                    paintCells2d
                )
                break;
            case "eq-triangle":
                drawEquilateralTriangle(startingCoords.gridX, startingCoords.gridY, 6, paintCells2d)
                break;
            case 'circle':
                if (fixedRadius.checked) radius = parseInt(fixedRadiusValue.value)
                if (circleAlgorithm.value == "accurate") {
                    drawCircle(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, paintCells2d, fillCircle.checked)
                } else if (circleAlgorithm.value == "natural") {
                    if (fillCircle.checked) {
                        drawNaturalFilledCircle(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, paintCells2d)
                    } else {
                        drawNaturalStrokeCircle(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, paintCells2d)
                    }
                }
                break;
            case "triangle":
                currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
                let tx = Math.floor(currentCellIndex / cols);
                let ty = currentCellIndex % cols
                drawEquilateralTriangle(startingCoords.gridY, startingCoords.gridX, paintCells2d, Math.abs(startingCoords.gridY - ty), parseInt(id("change-per-col").value), { allOn: id("all-changes-on").value })
                break;
            case 'sphere':
                drawSphere(startingCoords.gridX - radius, startingCoords.gridY + radius, radius, paintCells2d)
                break;
            case 'rect':
                drawRectangle(
                    startingCoords.gridY,
                    startingCoords.gridX,
                    fixedRectSize.checked ? parseInt(fixedRectWidth.value) : dx,
                    fixedRectSize.checked ? parseInt(fixedRectHeight.value) : dy,
                    paintCells2d,
                    fillRect.checked)
                break;
            case 'line':
                if (currentCell.classList[0] != "cell") return
                currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
                gridX = Math.floor(currentCellIndex / cols);
                gridY = currentCellIndex % cols
                drawLine(paintCells2d, startingCoords.gridY, startingCoords.gridX, gridY, gridX)
                break
            case 'line-stroke':
                if (currentCell.classList[0] != "cell") return
                currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
                gridX = Math.floor(currentCellIndex / cols)
                gridY = currentCellIndex % cols
                if (isStartOfLineStroke)
                    drawLine(paintCells2d, startingCoords.gridY, startingCoords.gridX, gridY, gridX)
                else
                    drawLine(paintCells2d, lastLineStrokeEndingCoords.gridY, lastLineStrokeEndingCoords.gridX, gridY, gridX)
                isStartOfLineStroke = false
                lastLineStrokeEndingCoords.gridX = gridX
                lastLineStrokeEndingCoords.gridY = gridY
                break
        }
        return
    }

    event.preventDefault();
    if (currentCell.classList[0] != "cell") return;
    setCellColor(currentCell, getCurrentSelectedColor());
});

function handleMousePaintEnd(event) {
    if (paintModeSelector.value == "selecting") {
        if (!selectionCoords) return;
        handleSelectionShowerVisibility("0", "0", "0", "0", "0");
        copy();
        for (let i = 0; i < selectionImageShowers.length; i++) {
            selectionImageShowers[i].src = colorDataToImage(selectedPart, 0, null);
            selectionImageShowers[i].style.border = "1px solid black";
        }
    } else if (paintModeSelector.value == "zoom") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        if (zoomedIn) {
            customAlert("Already Zoomed In... Try Zooming Out First...")
            return
        }
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
