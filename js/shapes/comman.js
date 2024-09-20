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
let selectedPart, zoomedPart, partToFlip, zoomOriginX, zoomOriginY, fullRows, fullCols, flipOriginY, flipOriginX
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

function drawSphere(cx, cy, r, grid) {
    let filled = true;
    // Calculate bounding box coordinates
    let minX = Math.max(0, cx - r);
    let maxX = Math.min(grid.length - 1, cx + r);
    let minY = Math.max(0, cy - r);
    let maxY = Math.min(grid[0].length - 1, cy + r);

    // Iterate within the bounding box
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (distance <= r) {
                if (filled || Math.abs((distance) - r) < 1) {
                    let color = brightenHexColor(getCurrentSelectedColor(), (1 - (distance / r)).toFixed(2))
                    setCellColor(grid[x][y], color);
                }
            }
        }
    }
}


function drawRectangle(x, y, w, h, plane, filled) {
    y++
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

function drawLine(array, x1, y1, x2, y2, lw = 1, lineCap = 'square') {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    const halfLw = Math.floor(lw / 2);

    while (x1 !== x2 || y1 !== y2) {
        drawThickPoint(array, x1, y1, lw, lineCap);
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
    drawThickPoint(array, x1, y1, lw, lineCap);
}

function drawThickPoint(array, x, y, lw, lineCap) {
    const halfLw = Math.floor(lw / 2);

    for (let i = -halfLw; i <= halfLw; i++) {
        for (let j = -halfLw; j <= halfLw; j++) {
            const distance = Math.sqrt(i * i + j * j);
            if (lineCap === "round" && distance <= halfLw) {
                setCellColorSafe(array, x + i, y + j, getCurrentSelectedColor());
            } else if (lineCap === "square") {
                setCellColorSafe(array, x + i, y + j, getCurrentSelectedColor());
            }
        }
    }
}

function setCellColorSafe(array, x, y, color) {
    if (x >= 0 && x < array[0].length && y >= 0 && y < array.length) {
        setCellColor(array[y][x], color);
    }
}


let currentCell;

let startingCoords = {}
let lastLineStrokeEndingCoords = {}
let isStartOfLineStroke
let selectionCoords
let pasteOffset = 0

function copy(mode = "select") {
    let xtl = selectionCoords.xtl,
        ytl = selectionCoords.ytl,
        ybr = selectionCoords.ybr,
        xbr = selectionCoords.xbr,
        array = toPaintData2D(buffer.getItem().slice()),
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
    if (mode == "zoom") zoomedPart = result
    else if (mode == "flip") partToFlip = result
    else if (mode == "select") {
        selectedPart = result
        selectionSize.textContent = `(w:${w},h:${h})`
    }
    return { failed: false }
}
function paste(xb, yb, data2d, paint2d, replaceBlending = false, zoomOut = false) {
    if (!data2d) return
    let h = data2d.length
    let w = data2d[0].length
    let xt = xb - w
    let yt = yb - h
    let array = data2d.flat();
    let j = 0
    let blendingMode = replaceBlending ? 'replace' : id("blend-mode-selector").value
    let ignoreTransparentCells = id('ignore-transparent-cells').checked
    for (let y = yt; y < yb; y++) {
        for (let x = xt; x < xb; x++) {
            if (paint2d[y]) {
                if (paint2d[y][x]) {
                    let bottomColor = convertRGBAStrToObj(buffer.getItem()[pack(x, y)])
                    let topColor = zoomOut ? convertRGBAStrToObj(array[j]) : hexToRgbaObject(array[j])
                    let finalColor = colorObjectToRGBA(blendColors(topColor, bottomColor, blendingMode))
                    if (ignoreTransparentCells && topColor.a == 0) finalColor = bottomColor
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
        shapesElems[i].ondblclick = () => gotoTab("shape-tools")
        if (!wasSettingActivated) shapeSettings[0].classList.add(ACTIVE_SHAPE_SETTING_CLASSNAME)
    }
}

function drawNaturalFilledCircle(cx, cy, r, matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let x = r;
    let y = 0;
    let radiusError = 1 - x;
    while (x >= y) {
        for (let i = cx - x; i <= cx + x; i++) {
            if (i >= 0 && i < rows) {
                if (cy + y >= 0 && cy + y < cols) setCellColor(matrix[i][cy + y], getCurrentSelectedColor())
                if (cy - y >= 0 && cy - y < cols) setCellColor(matrix[i][cy - y], getCurrentSelectedColor())
            }
        }
        for (let i = cx - y; i <= cx + y; i++) {
            if (i >= 0 && i < rows) {
                if (cy + x >= 0 && cy + x < cols) setCellColor(matrix[i][cy + x], getCurrentSelectedColor())
                if (cy - x >= 0 && cy - x < cols) setCellColor(matrix[i][cy - x], getCurrentSelectedColor())
            }
        }
        y++
        if (radiusError < 0) radiusError += 2 * y + 1;
        else {
            x--
            radiusError += 2 * (y - x + 1);
        }
    }
}


function drawNaturalStrokeCircle(cx, cy, r, matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let x = r;
    let y = 0;
    let radiusError = 1 - x
    while (x >= y) {
        if (cx + x >= 0 && cx + x < rows && cy + y >= 0 && cy + y < cols)
            setCellColor(matrix[cx + x][cy + y], getCurrentSelectedColor())
        if (cx + y >= 0 && cx + y < rows && cy + x >= 0 && cy + x < cols)
            setCellColor(matrix[cx + y][cy + x], getCurrentSelectedColor())
        if (cx - x >= 0 && cx - x < rows && cy + y >= 0 && cy + y < cols)
            setCellColor(matrix[cx - x][cy + y], getCurrentSelectedColor())
        if (cx - y >= 0 && cx - y < rows && cy + x >= 0 && cy + x < cols)
            setCellColor(matrix[cx - y][cy + x], getCurrentSelectedColor())
        if (cx - x >= 0 && cx - x < rows && cy - y >= 0 && cy - y < cols)
            setCellColor(matrix[cx - x][cy - y], getCurrentSelectedColor())
        if (cx - y >= 0 && cx - y < rows && cy - x >= 0 && cy - x < cols)
            setCellColor(matrix[cx - y][cy - x], getCurrentSelectedColor())
        if (cx + x >= 0 && cx + x < rows && cy - y >= 0 && cy - y < cols)
            setCellColor(matrix[cx + x][cy - y], getCurrentSelectedColor())
        if (cx + y >= 0 && cx + y < rows && cy - x >= 0 && cy - x < cols)
            setCellColor(matrix[cx + y][cy - x], getCurrentSelectedColor())
        y++
        if (radiusError < 0) radiusError += 2 * y + 1;
        else {
            x--
            radiusError += 2 * (y - x + 1)
        }
    }
}


function hideAllShapeSettings() {
    for (let i = 0; i < shapeSettings.length; i++) {
        if (shapeSettings[i].classList.contains(ACTIVE_SHAPE_SETTING_CLASSNAME))
            shapeSettings[i].classList.remove(ACTIVE_SHAPE_SETTING_CLASSNAME)
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
        updateSelectionUI()
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

for (let i = 0; i < zoomOutButtons.length; i++) zoomOutButtons[i].onclick = zoomOut

function zoomOut() {
    if (!zoomedIn) return
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
    let cells = document.querySelectorAll(".cell")
    let cells2d = []
    for (let i = 0; i < cells.length; i++) {
        cells2d.push(cells[i])
    }
    cells2d = toPaintData2D(cells2d, fullRows, fullCols)
    paste(zoomOriginX, zoomOriginY, partToPaste, cells2d, true, 'zoom-out')
    recordPaintData()
    sessions[currentSession].buffer = buffer
    for (let i = 0; i < zoomOutButtons.length; i++) {
        zoomOutButtons[i].style.cursor = "not-allowed"
    }

}

function updateSelectionUI() {
    for (let i = 0; i < selectionImageShowers.length; i++) {
        selectionImageShowers[i].src = colorDataToImage(selectedPart, 0, null);
        selectionImageShowers[i].style.border = "1px solid black";
    }
    id("selection-size").textContent = `(h:${selectedPart.length}, w:${selectedPart[0].length})`
}


id("select-all").onclick = () => {
    selectedPart = buffer.getItem().slice()
    selectedPart.forEach((e, i) => {
        selectedPart[i] = rgbaToHex(e)
    })
    selectedPart = toPaintData2D(selectedPart)
    updateSelectionUI()
}

function checkAllElementsEqual(array, value) {
    for (let i = 0; i < array.length; i++) if (array[i] !== value) return false;
    return true;
}

function shrink(matrix, color = "#00000000") {
    if (matrix.length == 0) return [["#00000000"]]
    let toPopTop = checkAllElementsEqual(matrix[0], color)
    let toPopBottom = checkAllElementsEqual(matrix[matrix.length - 1], color)
    let toPopLeft = checkAllElementsEqual(matrix.map(row => row[0]), color)
    let toPopRight = checkAllElementsEqual(matrix.map(row => row[row.length - 1]), color)
    if (!(toPopBottom || toPopTop || toPopLeft || toPopRight)) return matrix;
    if (toPopTop) matrix.shift();
    if (toPopBottom) matrix.pop();
    if (toPopLeft) matrix = matrix.map(row => row.slice(1));
    if (toPopRight) matrix = matrix.map(row => row.slice(0, -1));
    return shrink(matrix);
}

id('shrink-selection').onclick = () => {
    if (!selectedPart) return
    selectedPart = shrink(selectedPart)
    updateSelectionUI()
}

id("flip-selection-horizontally").onclick = () => {
    if (!selectedPart) return
    for (let i = 0; i < selectedPart.length; i++) selectedPart[i].reverse()
    updateSelectionUI()
}

id("flip-selection-vertically").onclick = () => {
    if (!selectedPart) return
    selectedPart.reverse()
    updateSelectionUI()
}

id("line-width").oninput = () => {
    id("line-width-shower").textContent = `(${id("line-width").value})`
}

id("stroke-line-width").oninput = () => {
    id("stroke-line-width-shower").textContent = `(${id("stroke-line-width").value})`
}