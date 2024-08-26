const shapeSettings = document.getElementsByClassName("shape-settings")
const ACTIVE_SHAPE_SETTING_CLASSNAME = "active-shape-setting"
const fillCircle = document.getElementById("fill-circle")
const fillRect = document.getElementById("fill-rect")
const circleAlgorithm = document.getElementById("circle-algorithm")
const fixedRadius = document.getElementById("fixed-radius")
const fixedRadiusValue = document.getElementById("fixed-radius-value")
const fixedRectSize = document.getElementById("fixed-rect-size")
const fixedRectWidth = document.getElementById("fixed-rect-width")
const fixedRectHeight = document.getElementById("fixed-rect-height")
const selectionShower = document.getElementById("selection-shower")
const shapesElems = document.getElementById("shapes-selector").children
const ACTIVE_SHAPE_CLASS = "active-shape"
const SELECTED_CELL_HINT_TOKEN = "selected-cell-hint"
let selectedPart, zoomedPart, zoomOriginX, zoomOriginY, fullRows, fullCols
let originalSnapshot, zoomedIn
const selectionImageShowers = document.querySelectorAll(".selection-image-shower")
const selectionSize = document.getElementById("selection-size")
selectionSize.textContent = "Nothing Selected!"
const connectLastLineLocation = document.getElementById("connect-last-line-location")
const lineLastCoords = {}

function drawCircle(centerX, centerY, radius, grid, filled = false, floored = false) {

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {

            const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);


            if (distance <= radius) {

                if (filled || Math.abs(distance - radius) < 1) {
                    setCellColor(grid[i][j], getCurrentSelectedColor());
                }
            }
        }
    }
}



function drawSphere(centerX, centerY, radius, grid) {
    let filled = true

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {

            const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);


            if (distance <= radius) {

                if (filled || Math.abs(distance - radius) < 1) {
                    setCellColor(grid[i][j], brightenHexColor(getCurrentSelectedColor(), radius / distance - 0.95))
                }
            }
        }
    }
}

function rawSphereV2(centerX, centerY, radius, grid) {
    let filled = true

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {

            const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);


            if (distance <= radius) {

                if (filled || Math.abs(distance - radius) < 1) {
                    setCellColor(grid[i][j], brightenHexColor(getCurrentSelectedColor(), 0))
                }
            }
        }
    }
}

function drawRectangle(x, y, w, h, plane, filled) {
    y += 1
    for (let i = (y - h); i < y; i++) {
        for (let j = x; j < (x + w); j++) {
            try {
                if (filled || j == x || j == (x + w - 1) || i == (y - h) || i == (y - 1))
                    setCellColor(plane[i][j], getCurrentSelectedColor())
            } catch {

            }
        }
    }
}

function drawDottedRectange(x, y, w, h, plane, filled = true) {
    y += 1
    l = 0
    for (vari = (y - h); i < y; i++) {
        for (let j = x; j < (x + w); j++) {
            try {
                if (filled || j == x || j == (x + w - 1) || i == (y - h) || i == (y - 1))
                    l++;
                if (l % 2 == 0) setCellColor(plane[i][j], getCurrentSelectedColor())
            } catch {

            }
        }
    }
}

function drawLine(array, x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    while (x1 !== x2 || y1 !== y2) {
        setCellColor(array[y1][x1], getCurrentSelectedColor());
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
    setCellColor(array[y1][x1], getCurrentSelectedColor());
}



let currentCell;

let startingCoords = {}
let lastLineStrokeEndingCoords = {}
let isStartOfLineStroke
let selectionCoords
let pasteOffset = 0

function copy(zoom = false) {
    let xtl = selectionCoords.xtl,
        ytl = selectionCoords.ytl,
        ybr = selectionCoords.ybr,
        xbr = selectionCoords.xbr,
        array = toPaintData2D(buffer.getItem().slice()),
        arrH = cols,
        arrW = rows,
        result = [],
        w = xbr - xtl,
        h = ybr - ytl
    for (let y = ytl; y < ybr; y++) {
        let row = array[y].slice(xtl, xbr)
        row.forEach((v, i, a) => {
            a[i] = rgbaToHex(a[i])
        })
        result.push(row)
    }
    selectionCoords = undefined
    if (result.length == 0) return { failed: true }
    if (zoom) zoomedPart = result
    else {
        selectedPart = result
        selectionSize.textContent = `(w:${w},h:${h})`
    }
    return { failed: false }
}
function paste(xb, yb, data2d, paint2d, zoomOut = false) {
    if (!data2d) return
    let h = data2d.length
    let w = data2d[0].length
    let xt = xb - w
    let yt = yb - h
    let array = data2d.flat();
    let j = 0
    let blendingMode = zoomOut ? 'replace' : id("blend-mode-selector").value
    for (let y = yt; y < yb; y++) {
        for (let x = xt; x < xb; x++) {
            if (paint2d[y]) {
                if (paint2d[y][x]) {
                    let bottomColor = convertRGBAStrToObj(buffer.getItem()[pack(x, y)])
                    let topColor = zoomOut ? convertRGBAStrToObj(array[j]) : hexToRgbaObject(array[j])
                    let finalColor = colorObjectToRGBA(blendColors(topColor, bottomColor, blendingMode))
                    setCellColor(paint2d[y][x], finalColor)
                }
            }
            j++

        }
    }
}

function handleSelectionShowerVisibility(height, width, top, left, borderWidth) {
    const selectionShower = document.getElementById("selection-shower")
    selectionShower.style.height = height
    selectionShower.style.width = width
    selectionShower.style.top = top
    selectionShower.style.left = left
    selectionShower.style.border = borderWidth + " solid " + borderColor
    selectionShower.style.background = "#33333355"
}


function removeActiveHintFromShapeElems() {
    for (let i = 0; i < shapesElems.length; i++)
        if (shapesElems[i].classList.contains(ACTIVE_SHAPE_CLASS))
            shapesElems[i].classList.remove(ACTIVE_SHAPE_CLASS)
}

for (let i = 0; i < shapesElems.length; i++) {
    shapesElems[i].onclick = () => {
        removeActiveHintFromShapeElems()
        //mouseClickSound.play()
        shapesElems[i].classList.add(ACTIVE_SHAPE_CLASS)
        paintModeSelector.value = shapesElems[i].dataset.value
        paintZone.style.cursor = shapesElems[i].dataset.cursor
        hideAllShapeSettings()
        let wasSettingActivated = false
        for (let i = 0; i < shapeSettings.length; i++) {
            if (shapeSettings[i].dataset.settingname == paintModeSelector.value) {
                shapeSettings[i].classList.add(ACTIVE_SHAPE_SETTING_CLASSNAME)
                wasSettingActivated = true
                break
            }
        }
        shapesElems[i].ondblclick = () => {
            gotoTab("shape-tools")
        }
        if (!wasSettingActivated) shapeSettings[0].classList.add(ACTIVE_SHAPE_SETTING_CLASSNAME)

    }
}

function drawNaturalFilledCircle(centerX, centerY, radius, array2D) {
    const rows = array2D.length;
    const cols = array2D[0].length;
    let x = radius;
    let y = 0;
    let radiusError = 1 - x;
    while (x >= y) {
        for (let i = centerX - x; i <= centerX + x; i++) {
            if (i >= 0 && i < rows) {
                if (centerY + y >= 0 && centerY + y < cols) {
                    setCellColor(array2D[i][centerY + y], getCurrentSelectedColor())
                }
                if (centerY - y >= 0 && centerY - y < cols) {
                    setCellColor(array2D[i][centerY - y], getCurrentSelectedColor())
                }
            }
        }

        for (let i = centerX - y; i <= centerX + y; i++) {
            if (i >= 0 && i < rows) {
                if (centerY + x >= 0 && centerY + x < cols) {
                    setCellColor(array2D[i][centerY + x], getCurrentSelectedColor())
                }
                if (centerY - x >= 0 && centerY - x < cols) {
                    setCellColor(array2D[i][centerY - x], getCurrentSelectedColor())
                }
            }
        }

        y++;

        if (radiusError < 0) {
            radiusError += 2 * y + 1;
        } else {
            x--;
            radiusError += 2 * (y - x + 1);
        }
    }
}


function drawNaturalStrokeCircle(centerX, centerY, radius, array2D) {
    const rows = array2D.length;
    const cols = array2D[0].length;
    let x = radius;
    let y = 0;
    let radiusError = 1 - x;

    while (x >= y) {
        if (centerX + x >= 0 && centerX + x < rows && centerY + y >= 0 && centerY + y < cols) {
            setCellColor(array2D[centerX + x][centerY + y], getCurrentSelectedColor())
        }
        if (centerX + y >= 0 && centerX + y < rows && centerY + x >= 0 && centerY + x < cols) {
            setCellColor(array2D[centerX + y][centerY + x], getCurrentSelectedColor())
        }
        if (centerX - x >= 0 && centerX - x < rows && centerY + y >= 0 && centerY + y < cols) {
            setCellColor(array2D[centerX - x][centerY + y], getCurrentSelectedColor())
        }
        if (centerX - y >= 0 && centerX - y < rows && centerY + x >= 0 && centerY + x < cols) {
            setCellColor(array2D[centerX - y][centerY + x], getCurrentSelectedColor())
        }
        if (centerX - x >= 0 && centerX - x < rows && centerY - y >= 0 && centerY - y < cols) {
            setCellColor(array2D[centerX - x][centerY - y], getCurrentSelectedColor())
        }
        if (centerX - y >= 0 && centerX - y < rows && centerY - x >= 0 && centerY - x < cols) {
            setCellColor(array2D[centerX - y][centerY - x], getCurrentSelectedColor())
        }
        if (centerX + x >= 0 && centerX + x < rows && centerY - y >= 0 && centerY - y < cols) {
            setCellColor(array2D[centerX + x][centerY - y], getCurrentSelectedColor())
        }
        if (centerX + y >= 0 && centerX + y < rows && centerY - x >= 0 && centerY - x < cols) {
            setCellColor(array2D[centerX + y][centerY - x], getCurrentSelectedColor())
        }

        y++;

        if (radiusError < 0) {
            radiusError += 2 * y + 1;
        } else {
            x--;
            radiusError += 2 * (y - x + 1);
        }
    }
}


function hideAllShapeSettings() {
    for (let i = 0; i < shapeSettings.length; i++) {
        if (shapeSettings[i].classList.contains(ACTIVE_SHAPE_SETTING_CLASSNAME))
            shapeSettings[i].classList.remove(ACTIVE_SHAPE_SETTING_CLASSNAME)
    }
}

function drawRoundedRectangle(startX, startY, width, height, borderRadius, array2D, fill = false) {
    const rows = array2D.length;
    const cols = array2D[0].length;

    const endX = startX + width;
    const endY = startY + height;


    const clampedBorderRadius = Math.max(0, Math.min(borderRadius, 1));
    const radiusX = clampedBorderRadius * width;
    const radiusY = clampedBorderRadius * height;

    for (let i = startX; i < endX; i++) {
        for (let j = startY; j < endY; j++) {
            if (
                (i >= startX + radiusX && i < endX - radiusX && j >= startY && j < endY) ||
                (i >= startX && i < endX && j >= startY + radiusY && j < endY - radiusY) ||
                (Math.pow((i - startX - radiusX) / radiusX, 2) + Math.pow((j - startY - radiusY) / radiusY, 2) >= 1)
            ) {
                if (fill) {
                    setCellColor(array2D[i][j], getCurrentSelectedColor());
                }
            }
        }
    }
}

const rotateCopiedDataButtons = document.getElementsByClassName("rotate-copied-data")

for (let i = 0; i < rotateCopiedDataButtons.length; i++) {
    rotateCopiedDataButtons[i].onclick = () => {
        if (!selectedPart) {
            customAlert("No Data Selected")
            return
        }
        selectedPart = rotateArray90Degrees(selectedPart, false)
        selectionSize.textContent = `(w:${selectedPart[0].length},h:${selectedPart.length})`
        for (let i = 0; i < selectionImageShowers.length; i++) {
            selectionImageShowers[i].src = colorDataToImage(selectedPart, 0, null)
            selectionImageShowers[i].style.border = "1px solid black"
        }
    }
}

function drawEquilateralTriangle(blx, bly, pixels, size, perColDY = 1, options = {}) {
    if (blx == -1 || bly == -1) return
    let linesize = size
    while (linesize > 0) {
        for (let dx = 0; dx < linesize; dx++) {
            setCellColor(pixels[bly][blx + dx], getCurrentSelectedColor())
        }
        bly--
        linesize -= perColDY
        if (options.allOn == "left") blx += perColDY
        else if (options.allOn == "right") blx
        else blx += (Math.ceil(perColDY / 2))
    }
}

let zoomOutButtons = document.getElementsByClassName("zoom-out")

for (let i = 0; i < zoomOutButtons.length; i++) {
    zoomOutButtons[i].onclick = zoomOut
}

function zoomOut() {
    if (!zoomedIn) {
        customAlert("Already Zoomed Out...")
        return
    }
    zoomedIn = false
    id("top-zoom-out").style.border = "1px solid var(--primary)"
    let partToPaste = toPaintData2D(buffer.getItem().slice())
    originalSnapshot = JSON.parse(originalSnapshot)
    let fullBuffer = new Stack(64)
    fullBuffer.data = originalSnapshot.data
    fullBuffer.limit = originalSnapshot.limit
    fullBuffer.pointer = originalSnapshot.pointer
    applySelectedPartSilent(toPaintData2D(fullBuffer.getItem(), fullRows, fullCols))
    buffer = fullBuffer
    let paintCells = document.querySelectorAll(".cell")
    let paintCells2d = []
    for (let i = 0; i < paintCells.length; i++) {
        paintCells2d.push(paintCells[i])
    }
    paintCells2d = toPaintData2D(paintCells2d, fullRows, fullCols)
    paste(zoomOriginX, zoomOriginY, partToPaste, paintCells2d, true)
    recordPaintData()
    sessions[currentSession].buffer = buffer
    for (let i = 0; i < zoomOutButtons.length; i++) {
        zoomOutButtons[i].style.cursor = "not-allowed"
    }

}


id("select-all").onclick = () => {
    selectedPart = buffer.getItem().slice()
    selectedPart.forEach((e, i) => {
        selectedPart[i] = rgbaToHex(e)
    })
    selectedPart = toPaintData2D(selectedPart)
    for (let i = 0; i < selectionImageShowers.length; i++) {
        selectionImageShowers[i].src = colorDataToImage(selectedPart, 0, null);
        selectionImageShowers[i].style.border = "1px solid black";
    }
}
