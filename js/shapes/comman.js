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
let penFloodFillCoordsVisited = new Set()
let penFillBuffer
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
            if (plane[i] && plane[i][j] && (filled || j == x || j == (x + w - 1) || i == (y - h) || i == (y - 1)))
                setCellColor(plane[i][j], getCurrentSelectedColor())
        }
    }
}

let alreadyFilledLinePoints = new Set()
function drawLine(array, x1, y1, x2, y2, lw = 1, lineCap = 'round', allowDoubles = false) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    while (x1 !== x2 || y1 !== y2) {
        drawThickPoint(array, x1, y1, lw, lineCap, allowDoubles);
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
    drawThickPoint(array, x1, y1, lw, lineCap, allowDoubles);
}

function drawThickPoint(array, x, y, lw, lineCap, allowDoubles) {
    const halfLw = Math.floor(lw / 2);
    for (let i = -halfLw; i <= halfLw; i++) {
        for (let j = -halfLw; j <= halfLw; j++) {
            const distance = Math.sqrt(i * i + j * j);
            if (lineCap === "round" && distance <= halfLw) {
                setCellColorSafe(array, x + i, y + j, allowDoubles);
            } else if (lineCap === "square") {
                setCellColorSafe(array, x + i, y + j, allowDoubles);
            }
        }
    }
}

function setCellColorSafe(array, x, y, allowDoubles) {
    const point = pack(x, y);
    if (alreadyFilledLinePoints.has(point) && (!allowDoubles)) return;
    if (x >= 0 && x < array[0].length && y >= 0 && y < array.length) {
        setCellColor(array[y][x], getCurrentSelectedColor());
    }
    alreadyFilledLinePoints.add(point);
}

function drawCurve(array, x1, y1, x2, y2, lw = 1, lineCap = 'square', curvature = 0.5, centerPoint = 0.5, steps = 10) {
    let allowDoubles = id("allow-curve-doubles").checked
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const centerX = x1 + centerPoint * dx;
    const centerY = y1 + centerPoint * dy;
    const controlX = centerX - curvature * dy / distance * (distance / 2);
    const controlY = centerY + curvature * dx / distance * (distance / 2);
    drawQuadraticBezier(array, x1, y1, controlX, controlY, x2, y2, lw, lineCap, steps, allowDoubles);
}

function drawQuadraticBezier(array, x1, y1, cx, cy, x2, y2, lw, lineCap, steps, allowDoubles) {
    let lastLine;
    for (let t = 0; t <= 1; t += 1 / steps) {
        const x = Math.round((1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2);
        const y = Math.round((1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2);
        if (lastLine && !(isNaN(lastLine.x) || isNaN(lastLine.y))) drawLine(array, x, y, lastLine.x, lastLine.y, lw, lineCap, allowDoubles);
        lastLine = { x, y }
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
            a[i] = rgbaToHex(v)
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

function paste(xb, yb, data2d, paint2d, oop = "paste") {
    if (!data2d) return
    let h = data2d.length
    let w = data2d[0].length
    let xt = xb - w
    let yt = yb - h
    let array = data2d.flat();
    let j = 0
    let ignoreTransparentCells = oop != "paste" ? false : id('ignore-transparent-cells').checked;
    for (let y = yt; y < yb; y++) {
        for (let x = xt; x < xb; x++) {
            if (paint2d[y]) {
                if (paint2d[y][x]) {
                    color = oop == 'zoom-out' ? rgbaToHex(array[j]) : array[j]
                    if (!(ignoreTransparentCells && color == "#00000000")) {
                        setCellColor(paint2d[y][x], color)
                    }
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

function drawNaturalCircle(cx, cy, r, matrix, filled = true) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let x = r;
    let y = 0;
    let radiusError = 1 - x;
    if (filled) {
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
    } else {
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
    let lineSize = size
    while (lineSize > 0) {
        for (let dx = 0; dx < lineSize; dx++) {
            setCellColor(pixels[bly][blx + dx], getCurrentSelectedColor())
        }
        bly--
        lineSize -= perColDY
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
    paste(zoomOriginX, zoomOriginY, partToPaste, cells2d, 'zoom-out')
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

function visualiseThickness(thickness, lineCap) {
    refillCanvas()
    drawThickPoint(cells2d, Math.floor(cols / 2), Math.floor(rows / 2), thickness, lineCap, true)
}

attachInputListener('line-width', () => {
    visualiseThickness(id('line-width').value, id('line-cap').value)
}, '')

id('line-width').onmouseup = refillCanvas
id('line-width').ontouchend = refillCanvas

attachInputListener('stroke-line-width', () => {
    visualiseThickness(id('stroke-line-width').value, id('stroke-line-cap').value)
}, '')
id('stroke-line-width').onmouseup = refillCanvas
id('stroke-line-width').ontouchend = refillCanvas


attachInputListener('curve-line-width', () => {
    visualiseThickness(id('curve-line-width').value, id('curve-line-cap').value)
}, '')
id('curve-line-width').onmouseup = refillCanvas
id('curve-line-width').ontouchend = refillCanvas


attachInputListener('curve-origin', visualiseCurve, '')
attachInputListener('curvature', visualiseCurve, '')
id("curve-depth").oninput = visualiseCurve


function drawEquilateralTriangle(blx, bly, pixels, size, perColDY = 1, options = {}) {
    if (blx == -1 || bly == -1) return
    let lineSize = size
    while (lineSize > 0) {
        for (let dx = 0; dx < lineSize; dx++) {
            setCellColor(pixels[bly][blx + dx], getCurrentSelectedColor())
        }
        bly--
        lineSize -= perColDY
        if (options.allOn == "left") blx += perColDY
        else if (options.allOn == "right") blx
        else blx += (Math.ceil(perColDY / 2))
    }
}

// GRADIENT VISUALISER
const gradientCanvas = id("gradient-visualiser")
const gradientCtx = gradientCanvas.getContext("2d")
gradientCanvas.width = 400
gradientCanvas.height = gradientCanvas.width * 0.5

function visualiseGradient() {
    let startColor = id("gradient-start-color").value;
    let endColor = id("gradient-end-color").value;
    let gradient;
    if (id("gradient-type").value == 'linear') {
        let angle = parseInt(id("linear-gradient-angle").value)
        let radians = (180 - angle) * Math.PI / 180;

        let x0 = gradientCanvas.width / 2 + Math.cos(radians) * gradientCanvas.width / 2;
        let y0 = gradientCanvas.height / 2 + Math.sin(radians) * gradientCanvas.height / 2;
        let x1 = gradientCanvas.width / 2 - Math.cos(radians) * gradientCanvas.width / 2;
        let y1 = gradientCanvas.height / 2 - Math.sin(radians) * gradientCanvas.height / 2;
        gradient = gradientCtx.createLinearGradient(x0, y0, x1, y1);
    } else {
        let radius = Math.min(gradientCanvas.width, gradientCanvas.height) / 2;
        gradient = gradientCtx.createRadialGradient(
            gradientCanvas.width / 2, gradientCanvas.height / 2, 0,
            gradientCanvas.width / 2, gradientCanvas.height / 2, radius
        );
    }
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    gradientCtx.fillStyle = gradient;
    gradientCtx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
}
visualiseGradient()

id("gradient-type").oninput = visualiseGradient
id("gradient-start-color").oninput = visualiseGradient
id("gradient-end-color").oninput = visualiseGradient

// CURVE VISUALISER
const curveCanvas = id("curve-visualiser")
const curveCtx = curveCanvas.getContext("2d")
curveCanvas.width = 400
curveCanvas.height = curveCanvas.width
curveCtx.lineWidth = 10
curveCtx.lineCap = 'round'

function visualiseCurve() {
    curveCtx.fillStyle = 'white';
    curveCtx.fillRect(0, 0, curveCanvas.width, curveCanvas.height);
    curveCtx.fillStyle = 'black';

    let curvature = Number(id("curvature").value);
    curvature += Number(id("curve-depth").value) * (Math.sign(curvature) || 1);

    const centerPoint = Number(id('curve-origin').value);
    let x1 = 0, y1 = curveCanvas.height / 2;
    let x2 = curveCanvas.width, y2 = curveCanvas.height / 2;

    const steps = 100;
    const dx = x2 - x1, dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const centerX = x1 + centerPoint * dx, centerY = y1 + centerPoint * dy;

    const controlX = centerX - curvature * dy / distance * (distance / 2);
    const controlY = centerY + curvature * dx / distance * (distance / 2);

    let firstPoint = true;
    curveCtx.strokeStyle = 'black';

    for (let t = 0; t <= 1; t += 1 / steps) {
        const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * controlX + t * t * x2;
        const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * controlY + t * t * y2;

        if (firstPoint) {
            curveCtx.beginPath();
            curveCtx.moveTo(x, y);
            firstPoint = false;
        } else {
            curveCtx.lineTo(x, y);
        }
    }
    curveCtx.stroke();
    curveCtx.closePath();
    curveCtx.beginPath();
    curveCtx.strokeStyle = 'red';
    curveCtx.moveTo(controlX, (curveCanvas.height / 2) - 50);
    curveCtx.lineTo(controlX, (curveCanvas.height / 2) + 50);
    curveCtx.stroke();
    curveCtx.closePath();
}


visualiseCurve();

function drawGradient(matrix, xb, yb, n, x, startColor, endColor, type = 'linear', angle = 0) {
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    const [r1, g1, b1] = hexToRgb(startColor);
    const [r2, g2, b2] = hexToRgb(endColor);
    const rStep = r2 - r1;
    const gStep = g2 - g1;
    const bStep = b2 - b1;
    const opacityTail = Math.round(id('gradient-opacity').value * 255).toString(16).padStart(2, '0').toUpperCase();
    if (type === 'linear') {
        const radAngle = (angle * Math.PI) / 180;
        const cosA = Math.cos(radAngle);
        const sinA = Math.sin(radAngle);

        const halfWidth = x / 2;
        const halfHeight = n / 2;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < x; j++) {
                const translatedX = j - halfWidth;
                const translatedY = i - halfHeight;
                const projection = translatedX * cosA + translatedY * sinA;
                const normalizedStep = (projection + halfWidth) / x;
                const step = Math.min(Math.max(normalizedStep, 0), 1);
                let r = Math.round(r1 + rStep * step);
                let g = Math.round(g1 + gStep * step);
                let b = Math.round(b1 + bStep * step);
                setCellColor(matrix[yb - i][j + xb], rgbToHex(r, g, b) + opacityTail);
            }
        }
    }
    if (type === 'radial') {
        const centerX = Math.floor(x / 2);
        const centerY = Math.floor(n / 2);
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < x; j++) {
                const distX = j - centerX;
                const distY = i - centerY;
                const distance = Math.sqrt(distX * distX + distY * distY);
                const step = Math.min(distance / maxRadius, 1)
                let r = Math.round(r1 + rStep * step);
                let g = Math.round(g1 + gStep * step);
                let b = Math.round(b1 + bStep * step);
                setCellColor(matrix[yb - i][j + xb], rgbToHex(r, g, b) + opacityTail);
            }
        }
    }
}

id("fill-all-gradient").onclick = () => {
    drawGradient(cells2d, 0, rows - 1, rows, cols, id('gradient-start-color').value, id("gradient-end-color").value, id('gradient-type').value, id('linear-gradient-angle').value)
    recordPaintData()
}

id('linear-gradient-angle').oninput = () => {
    id('linear-gradient-angle-shower').innerHTML = `(${id('linear-gradient-angle').value}&deg)`
    visualiseGradient()
}
id('gradient-opacity').oninput = () => id('gradient-opacity-shower').innerHTML = `(${id('gradient-opacity').value})`


function getDifference(sx, sy, ex, ey) {
    let dxRaw = -1 * (sx - ex) + 1
    let dyRaw = (sy - ey) + 1
    let dx = dxRaw, dy = dyRaw
    if (dxRaw < 1) dx = 1
    if (dyRaw < 1) dy = 1
    return [dxRaw * -1, dyRaw, dx, dy]
}

function refillCanvas() {
    for (let i = 0; i < cells.length; i++) cells[i].style.backgroundColor = buffer.getItem()[i];
}


const shapeInfoShower = id('shape-info-shower')
const cursorInfoShower = id('cursor-info')
let lastRadius = 5, lastStarRadius = 5

function draw(e, ex, ey, sx, sy, sgx, sgy) {
    let currentCell = document.elementFromPoint(ex, ey);
    let cellIndex = currentCell.index
    let egx = cellIndex % cols
    let egy = Math.floor(cellIndex / cols)

    let [dxRaw, dyRaw, dx, dy] = getDifference(sgx, sgy, egx, egy);
    cursorInfoShower.textContent = `[x${egx + 1},y${egy + 1}]`
    let radius = dx
    switch (paintModeSelector.value) {
        case 'line-stroke':
            if (currentCell.classList[0] != "cell") return
            if (isStartOfLineStroke)
                drawLine(cells2d, sgx, sgy, egx, egy, id('stroke-line-width').value, id("stroke-line-cap").value, id("allow-line-stroke-doubles").checked)
            else
                drawLine(cells2d, lastLineStrokeEndingCoords.gridX, lastLineStrokeEndingCoords.gridY, egx, egy, id('stroke-line-width').value, id("stroke-line-cap").value, id("allow-line-stroke-doubles").checked)
            isStartOfLineStroke = false
            lastLineStrokeEndingCoords.gridY = egy
            lastLineStrokeEndingCoords.gridX = egx
            break
        case "flip":
        case "zoom":
        case "selecting":
            if (paintModeSelector.value == "zoom" && zoomedIn) break
            let paintZonePosition = paintZone.getBoundingClientRect()
            let correctedStartingY = sy - paintZonePosition.y
            let correctedStartingX = sx - paintZonePosition.x
            handleSelectionShowerVisibility(
                // 1 is border width of self (h, w, t, l)
                (egy - sgy + 1) * cellWidth + "px",
                (egx - sgx + 1) * cellWidth + "px",
                (correctedStartingY - (correctedStartingY % cellWidth)) + "px",
                (correctedStartingX - (correctedStartingX % cellWidth)) + "px",
                "1px"
            )
            selectionCoords = {
                ytl: Math.min(Math.max(sgy, 0), rows),
                xtl: Math.min(Math.max(sgx, 0), cols),
                ybr: Math.min(egy + 1, rows),
                xbr: Math.min(egx + 1, cols)
            }
            break
        case "paste":
            if (!selectedPart) return
            if (currentCell.classList[0] != "cell") return
            let py = egy + selectedPart.length
            let px = egx + selectedPart[0].length
            paste(px, py, selectedPart, cells2d, 'paste')
            break
        case 'rect':
            let bx, by, h, w
            if (fixedRectSize.checked) {
                bx = egx, by = egy, w = parseInt(fixedRectWidth.value), h = parseInt(fixedRectHeight.value)
            } else {
                bx = sgx, by = sgy, w = dx, h = dy
                if (!e.shiftKey && dxRaw >= 0) bx = egx, w = dxRaw + 2
                if (!e.shiftKey && dyRaw <= 0) by = egy, h = Math.abs(dyRaw) + 2
            }
            if (e.shiftKey) {
                let distance = Math.round(Math.sqrt((((ex - sx) ** 2) + ((ey - sy) ** 2))) / cellWidth)
                h = distance
                w = distance
            }
            drawRectangle(bx, by, w, h, cells2d, fillRect.checked)
            shapeInfoShower.innerHTML = `[h${h}:w${w}]`
            break
        case 'circle':
            if (e.altKey) id('fixed-radius-value').value = radius
            if (fixedRadius.checked) radius = parseInt(fixedRadiusValue.value)
            else if (e.shiftKey) radius = lastRadius
            let circleX = (fixedRadius.checked || e.shiftKey) ? egy : (sgy - radius)
            let circleY = (fixedRadius.checked || e.shiftKey) ? egx : (sgx + radius)
            if (circleAlgorithm.value == "accurate")
                drawCircle(circleX, circleY, radius, cells2d, fillCircle.checked)
            else if (circleAlgorithm.value == "natural")
                drawNaturalCircle(circleX, circleY, radius, cells2d, fillCircle.checked)
            shapeInfoShower.innerHTML = `[r${radius}]`
            lastRadius = radius
            break
        case 'line':
            if (currentCell.classList[0] != "cell") return
            if (e.shiftKey) {
                let distance = Math.round(Math.sqrt((((ex - sx) ** 2) + ((ey - sy) ** 2))) / cellWidth)
                let angle = Math.round(getAngle(sgx, sgy, egx, egy) / 45) * 45
                let ec = calculateEndingCoords(sgx, sgy, Math.round(getAngle(sgx, sgy, egx, egy) / 45) * 45, distance)
                drawLine(cells2d, sgx, sgy, Math.round(ec.x), Math.round(ec.y), id('line-width').value, id('line-cap').value, id("allow-line-doubles").checked)
                shapeInfoShower.innerHTML = `[${(-1 * Math.round(angle)) + 180}&deg;]`
            } else {
                drawLine(cells2d, sgx, sgy, egx, egy, id('line-width').value, id('line-cap').value, id("allow-line-doubles").checked)
                shapeInfoShower.innerHTML = `[${(-1 * Math.round(getAngle(sgx, sgy, egx, egy))) + 180}&deg;]`
            }
            alreadyFilledLinePoints = new Set()
            break
        case "triangle":
            drawEquilateralTriangle(sgx, sgy, cells2d, Math.abs(sgx - egx), parseInt(id("change-per-col").value), { allOn: id("all-changes-on").value })
            break
        case 'sphere':
            drawSphere(sgy - radius, sgx + radius, radius, cells2d)
            break
        case 'curve':
            if (currentCell.classList[0] != "cell") return
            let curvature = Number(id("curvature").value)
            curvature += Number(id("curve-depth").value) * (Math.sign(curvature) || 1)
            let curveLineWidth = id('curve-line-width').value,
                curveLineCap = id('curve-line-cap').value,
                curveOrigin = id('curve-origin').value,
                curveSteps = id("curve-steps").value
            drawCurve(cells2d, sgx, sgy, egx, egy, curveLineWidth, curveLineCap, curvature, curveOrigin, curveSteps)
            alreadyFilledLinePoints = new Set()
            break
        case 'gradient':
            let gradientStartColor = id('gradient-start-color').value,
                gradientEndColor = id('gradient-end-color').value,
                gradientType = id('gradient-type').value,
                linearGradientAngle = id('linear-gradient-angle').value
            drawGradient(cells2d, sgx, sgy, dy, dx, gradientStartColor, gradientEndColor, gradientType, linearGradientAngle)
            break
        case 'pen-fill':
            if (penFloodFillCoordsVisited.has(`${egx}-${egy}`)) return
            let color = id('pen-fill-with-one-color').checked ? getCurrentSelectedColor() : false
            let [data, visited] = floodFillWithCoords(penFillBuffer, egx, egy, color)
            penFillBuffer = data.slice()
            applyPaintData(data.flat())
            penFloodFillCoordsVisited = new Set([...penFloodFillCoordsVisited, ...visited])
            break
        case 'cuboid':
            let cuboidW = valueAsNumber('cuboid-width'),
                cuboidH = valueAsNumber('cuboid-height'),
                cuboidB = valueAsNumber('cuboid-breadth'),
                cuboidRX = valueAsNumber('cuboid-rotation-x'),
                cuboidRY = valueAsNumber('cuboid-rotation-y'),
                cuboidRZ = valueAsNumber('cuboid-rotation-z')
            if (e.altKey) {
                let dist = Math.ceil(distance2d(sgx, sgy, egx, egy))
                cuboidB = dist
                cuboidH = dist
                cuboidW = dist
            }
            drawCuboid(cells2d, egx, egy, cuboidW, cuboidH, cuboidB, cuboidRX, cuboidRY, cuboidRZ)
            break
        case 'star':
            let starRadius = Math.ceil(distance2d(sgx, sgy, egx, egy))
            let starInnerRadius = valueAsNumber('star-inner-radius')
            let starPoints = valueAsNumber('star-points')
            let starX = sgx, starY = sgy
            if (e.shiftKey) {
                starRadius = lastStarRadius
                starX = egx
                starY = egy
            }
            console.log(cells2d, starX, starY, starRadius, starInnerRadius, starPoints);
            
            drawStar(cells2d, starX, starY, starRadius, starInnerRadius, starPoints)
            lastStarRadius = starRadius
            break
    }
}

function calculateEndingCoords(startX, startY, angle, length) {
    angle = angle * Math.PI / 180;
    let endX = startX + length * Math.cos(angle);
    let endY = startY + length * Math.sin(angle);
    return { x: endX, y: endY };
}

function getAngle(x1, y1, x2, y2) {
    const deltaY = y2 - y1;
    const deltaX = x2 - x1;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angleInDegrees = angleInRadians * (180 / Math.PI);
    return angleInDegrees;
}

function drawStar(matrix, cx, cy, outerRadius, innerRadiusPercent, points) {
    let step = Math.PI / points;
    let vertices = [];
    let innerRadius = (innerRadiusPercent / 100) * outerRadius;
    for (let i = 0; i < 2 * points; i++) {
        let angle = i * step - Math.PI / 2;
        let r = (i % 2 === 0) ? outerRadius : innerRadius;
        let x = Math.round(cx + r * Math.cos(angle));
        let y = Math.round(cy + r * Math.sin(angle));
        vertices.push([x, y]);
    }
    for (let i = 0; i < vertices.length; i++) {
        let [x1, y1] = vertices[i];
        let [x2, y2] = vertices[(i + 1) % vertices.length];
        drawSimpleLine(matrix, x1, y1, x2, y2);
    }
}

function drawSimpleLine(matrix, x1, y1, x2, y2) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        try {
            setCellColor(matrix[y1][x1], getCurrentSelectedColor());
        } catch { }

        if (x1 === x2 && y1 === y2) break; // Exit when the line ends
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

function visualiseStar() {
    refillCanvas()
    let x = Math.floor(cols / 2) - 1
    let y = Math.floor(rows / 2) - 1
    let size = Math.floor(Math.min(cols, rows) / 2)
    let innerRadiusPercent = valueAsNumber("star-inner-radius")
    let points = valueAsNumber('star-points')

    drawStar(cells2d, x, y, size, innerRadiusPercent, points)
}

attachInputListener('star-points', visualiseStar)
id('star-points').ontouchend = refillCanvas
id('star-points').onmouseup = refillCanvas


attachInputListener('star-inner-radius', visualiseStar, '%')
id('star-inner-radius').ontouchend = refillCanvas
id('star-inner-radius').onmouseup = refillCanvas
