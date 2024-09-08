let wasLastTouchStart = false

paintZone.addEventListener('touchstart', (event) => {
    wasLastTouchStart = true
    const { targetTouches } = event;
    const touch = targetTouches[0];
    if (["none", "stroke"].includes(paintModeSelector.value)) return
    const x = touch.clientX;
    const y = touch.clientY;
    const currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
    startingCoords.gridX = Math.floor(currentCellIndex / cols);
    startingCoords.gridY = currentCellIndex % cols
    startingCoords.x = x
    startingCoords.y = y
    if (paintModeSelector.value == "line" && connectLastLineLocation.checked && lineLastCoords != {}) {
        let paintCells2d = []
        for (let i = 0; i < paintCells.length; i++)
            paintCells2d.push(paintCells[i])
        paintCells2d = toPaintData2D(paintCells2d)
        drawLine(paintCells2d, lineLastCoords.x, lineLastCoords.y, startingCoords.gridY, startingCoords.gridX)
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
    currentCell = document.elementFromPoint(x, y);
    if (!["stroke"].includes(paintModeSelector.value)) {
        let paintCells2d = []
        if (paintModeSelector.value != "line-stroke") {
            for (let i = 0; i < paintCells.length; i++) {
                paintCells[i].style.backgroundColor = buffer.getItem()[i]
            }
        }
        for (let i = 0; i < paintCells.length; i++) {
            paintCells2d.push(paintCells[i])
        }
        paintCells2d = toPaintData2D(paintCells2d)
        const paintZoneWidth = window.getComputedStyle(paintZone).getPropertyValue("width")
        const cw = (parseFloat(paintZoneWidth) / cols)
        let dx = Math.ceil(Math.abs(startingCoords.x - x) / cw)
        let dy = Math.ceil(Math.abs(startingCoords.y - y) / cw)

        let gridY, gridX, currentCellIndex
        let radius = dx
        event.preventDefault()
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
                if (currentCell.classList[0] != "cell") return
                currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
                gridY = Math.floor(currentCellIndex / cols)
                gridX = currentCellIndex % cols
                paste(
                    gridX + selectedPart[0].length,
                    gridY + selectedPart.length,
                    selectedPart,
                    paintCells2d
                )
                break;
            case 'circle':
                if (fixedRadius.checked) radius = parseInt(fixedRadiusValue.value)
                let circleX, circleY
                if (fixedRadius.checked) {

                    currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
                    circleX = Math.floor(currentCellIndex / cols);
                    circleY = currentCellIndex % cols
                } else {
                    circleX = startingCoords.gridX - radius
                    circleY = startingCoords.gridY + radius
                }
                if (circleAlgorithm.value == "accurate") {
                    drawCircle(circleX, circleY, radius, paintCells2d, fillCircle.checked)
                } else if (circleAlgorithm.value == "natural") {
                    if (fillCircle.checked) {
                        drawNaturalFilledCircle(circleX, circleY, radius, paintCells2d)
                    } else {
                        drawNaturalStrokeCircle(circleX, circleY, radius, paintCells2d)
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
                if (fixedRectSize.checked) {
                    currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
                    gridX = Math.floor(currentCellIndex / cols);
                    gridY = currentCellIndex % cols
                    drawRectangle(gridY, gridX, parseInt(fixedRectWidth.value), parseInt(fixedRectHeight.value), paintCells2d, fillRect.checked)
                } else {
                    drawRectangle(
                        startingCoords.gridY,
                        startingCoords.gridX,
                        fixedRectSize.checked ? parseInt(fixedRectWidth.value) : dx,
                        fixedRectSize.checked ? parseInt(fixedRectHeight.value) : dy,
                        paintCells2d,
                        fillRect.checked
                    )

                }
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
    event.preventDefault()
    if (currentCell.classList[0] != "cell") return
    setCellColor(currentCell, getCurrentSelectedColor())
});

paintZone.addEventListener('touchend', (event) => {
    if (paintModeSelector.value == "selecting") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        if (!copy().failed) {
            for (let i = 0; i < selectionImageShowers.length; i++) {
                selectionImageShowers[i].src = colorDataToImage(selectedPart, 0, null)
                selectionImageShowers[i].style.border = "1px solid black"
            }
        }
    } else if (paintModeSelector.value == "zoom") {
        if (!selectionCoords) return
        handleSelectionShowerVisibility("0", "0", "0", "0", "0")
        if (zoomedIn){
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
            id("top-zoom-out").style.border= "3px solid var(--primary)"
            for (let i = 0; i < zoomOutButtons.length; i++) {
                zoomOutButtons[i].style.cursor = "zoom-out"
            }
        
        }
    }
    else if (paintModeSelector.value == "line") {
        let x = event.changedTouches[event.changedTouches.length - 1].clientX
        let y = event.changedTouches[event.changedTouches.length - 1].clientY
        currentCellIndex = Array.from(paintCells).indexOf(document.elementFromPoint(x, y))
        lineLastCoords.x = currentCellIndex % cols
        lineLastCoords.y = Math.floor(currentCellIndex / cols);
    }
    if (paintModeSelector.value != "none") recordPaintData()
})

function drawEquilateralTriangle(blx, bly, pixels, size, perColDY = 1, options = {}) {
    if (blx == -1 || bly == -1) return
    let linesize = size
    while (linesize > 0) {
        for (let dx = 0; dx < linesize; dx++) {
            pixels[bly][blx + dx].style.backgroundColor = getCurrentSelectedColor()
        }
        bly--
        linesize -= perColDY
        if (options.allOn == "left") blx += perColDY
        else if (options.allOn == "right") blx
        else blx += (Math.ceil(perColDY / 2))
    }
}