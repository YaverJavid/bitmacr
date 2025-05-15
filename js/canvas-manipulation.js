const addRowTop = document.querySelector("#add-row-top")
const addColRight = document.querySelector("#add-col-right")
const addColLeft = document.querySelector("#add-col-left")
const addRowDown = document.querySelector("#add-row-down")
const hByWRatio = document.getElementById("h-w-ratio")
const addColRowCount = id("add-col-row-count")
// THE BELOW IS FOR ADDING ROWS AND COLS
const giveUpUndoState = document.getElementById('give-up-undo-state')
const B_MAX_CANVAS_DIMENSION = "max-canvas-dimension"

setUpLocalStorageBucket(B_MAX_CANVAS_DIMENSION, "100")
const MAX_CANVAS_DIMENSION = getBucketVal(B_MAX_CANVAS_DIMENSION)
id("max-allowed-canvas-size").value = MAX_CANVAS_DIMENSION

addRowDown.onclick = () => {
    let data = []
    let pointer = 0
    let count = addColRowCount.value == "" ? 1 : parseInt(addColRowCount.value)

    pointer = buffer.pointer
    for (let j = 0; j < count; j++) {
        for (let i = 0; i < buffer.data.length; i++) {
            let paintData = buffer.data[i].slice()
            let newRow = []
            for (let i = 0; i < cols; i++) newRow.push("rgba(0,0,0,0)")
            paintData.push(...newRow)
            data.push(paintData)
        }
    }
    addCanvas(parseInt(rows) + count, cols)
    buffer.pointer = pointer
    applyPaintData(data[buffer.pointer], true)
    buffer.data = data
}

addRowTop.onclick = () => {
    let data = []
    let pointer = buffer.pointer
    let count = addColRowCount.value == "" ? 1 : parseInt(addColRowCount.value)
    for (let i = 0; i < buffer.data.length; i++) {
        let paintData = buffer.data[i].slice()
        for (let j = 0; j < count; j++) {
            let newRow = []
            for (let i = 0; i < cols; i++) newRow.push("rgba(0,0,0,0)")
            paintData.unshift(...newRow)
        }
        data.push(paintData)
    }
    addCanvas(parseInt(rows) + count, cols)
    buffer.pointer = pointer
    applyPaintData(data[buffer.pointer], true)
    buffer.data = data
}

addColRight.onclick = () => {
    let data = []
    let pointer = buffer.pointer
    let count = addColRowCount.value == "" ? 1 : parseInt(addColRowCount.value)
    let rightPart = []
    for (let j = 0; j < count; j++) rightPart.push("rgba(0,0,0,0)")
    for (let i = 0; i < buffer.data.length; i++) {
        let paintData = toPaintData2D(buffer.data[i].slice())
        for (let i = 0; i < paintData.length; i++) paintData[i].push(...rightPart)
        data.push(paintData.flat())
    }
    addCanvas(rows, parseInt(cols) + count)
    buffer.pointer = pointer
    applyPaintData(data[buffer.pointer], true)
    buffer.data = data
}

addColLeft.onclick = () => {
    let data = []
    let pointer = buffer.pointer
    let count = addColRowCount.value == "" ? 1 : parseInt(addColRowCount.value)
    let rightPart = []
    for (let j = 0; j < count; j++) rightPart.push("rgba(0,0,0,0)")
    for (let i = 0; i < buffer.data.length; i++) {
        let paintData = toPaintData2D(buffer.data[i].slice())
        for (let i = 0; i < paintData.length; i++) paintData[i].unshift(...rightPart)
        data.push(paintData.flat())
    }
    addCanvas(rows, parseInt(cols) + count)
    buffer.pointer = pointer
    applyPaintData(data[buffer.pointer], true)
    buffer.data = data
}

const shiftFill = document.getElementById("shift-fill")
const getShiftFillColor = () => shiftFill.checked ? getCurrentSelectedColor() : "rgba(0,0,0,0)"
shiftLeft.onclick = () => {
    let paintData2d = toPaintData2D(buffer.getItem())
    for (let i = 0; i < paintData2d.length; i++) {
        paintData2d[i].unshift(wrapShift.checked ? paintData2d[i][paintData2d[i].length - 1] : getShiftFillColor())
        paintData2d[i].pop()
    }
    applyPaintData(paintData2d.flat())
    recordPaintData()
}

id("shift-up").onclick = () => {
    let paintData2d = toPaintData2D(buffer.getItem())
    paintData2d.push(wrapShift.checked ? paintData2d.shift() : Array(paintData2d.shift().length).fill(getShiftFillColor()))
    applyPaintData(paintData2d.flat())
    recordPaintData()
}

id("shift-down").onclick = () => {
    let paintData2d = toPaintData2D(buffer.getItem())
    paintData2d.unshift(wrapShift.checked ? paintData2d.pop() : Array(paintData2d.pop().length).fill(getShiftFillColor()))
    applyPaintData(paintData2d.flat())
    recordPaintData()
}


id("shift-right").onclick = () => {
    let paintData2d = toPaintData2D(buffer.getItem())
    for (let i = 0; i < paintData2d.length; i++) {
        paintData2d[i].push(wrapShift.checked ? paintData2d[i].shift() : [getShiftFillColor(), paintData2d[i].shift()][0])
    }
    applyPaintData(paintData2d.flat())
    recordPaintData()
}

const B_ASPECT_RATIO = "pix-aspect-ratio"
setUpLocalStorageBucket(B_ASPECT_RATIO, "1")
hByWRatio.value = localStorageREF.getItem(B_ASPECT_RATIO)

hByWRatio.oninput = () => {
    localStorageREF.setItem(B_ASPECT_RATIO, hByWRatio.value)
}

id("flip-vertically").onclick = () => {
    applyPaintData(buffer.getItem().slice().reverse())
    recordPaintData()
}

id("flip-horizontally").onclick = () => {
    let paintData = toPaintData2D(buffer.getItem().slice())
    paintData.forEach((v, i, a) => a[i].reverse())
    applyPaintData(paintData.flat())
    recordPaintData()
}

id('clear-button').onclick = clearAll

function clearAll(){
    for (let i = 0; i < cells.length; i++)
        setCellColor(cells[i], "#00000000")
    recordPaintData()
}

id('fill-all-button').onclick = fillAll

function fillAll() {
    if (colorMSelector.value == 'lighting') return
    for (let i = 0; i < cells.length; i++) setCellColor(cells[i], getCurrentSelectedColor())
    recordPaintData()
}

cellsSlider.addEventListener("change", () => changeCanvasSize())
document.getElementById("increment-canvas-size").addEventListener("click", () => changeCanvasSize(1))
document.getElementById("decrement-canvas-size").addEventListener("click", () => changeCanvasSize(-1))

function getHByWRatio() {
    return hByWRatio.value == "" ? 1 : Math.abs(parseFloat(hByWRatio.value))
}

function changeCanvasSize(offset = 0) {
    cellsSlider.value = parseInt(cellsSlider.value) + offset
    if (Math.round(getHByWRatio() * cellsSlider.value) > MAX_CANVAS_DIMENSION) {
        customAlert(`Cannot add canvas with one dimension greater than ${MAX_CANVAS_DIMENSION}!`)
        cellsSlider.value = cols
        canvasSizeShower.innerHTML = `(c${cols} : r${rows})`
        return
    }
    canvasSizeShower.textContent = `(c${Math.round(getHByWRatio() * cellsSlider.value)} : r${cellsSlider.value})`
    customConfirm(`You will loose your artwork if you resize. Do you really want to resize from (c${cols} : r${rows}) to (r${cellsSlider.value} : c${Math.round(cellsSlider.value * getHByWRatio())})?`,
        () => {
            addCanvas(cellsSlider.value, Math.round(cellsSlider.value * getHByWRatio()))
        },
        () => {
            cellsSlider.value = cols
            canvasSizeShower.innerHTML = `(c${cols} : r${rows})`
        }
    )
}

function changeRowSize(offset = 0) {
    rowSlider.value = parseInt(rowSlider.value) + offset
    rowsShower.textContent = `(${rowSlider.value})`
    customConfirm(`You will loose your artwork if you resize. Do you really want to resize from ${rows} row(s) to ${rowSlider.value}row(s)?`,
        () => {
            addCanvas(rowSlider.value, cols)
        },
        () => {
            rowSlider.value = rows
            rowsShower.textContent = `(${rows})`
        })
}

function changeColSize(offset = 0) {
    let count = addColRowCount.value = "" ? 1 : parseInt(addColRowCount.value)
    colSlider.value = parseInt(colSlider.value) + offset
    colsShower.textContent = `(${colSlider.value})`
    customConfirm(`You will loose your artwork if you resize. Do you really want to resize from ${cols} col(s) to ${colSlider.value}col(s)?`,
        () => {
            addCanvas(rows, colSlider.value)
        },
        ifThen = () => {
            colSlider.value = cols
            colsShower.textContent = `(${cols})`
        })
}

cellsSlider.oninput = () => {
    canvasSizeShower.textContent = `(c${Math.round(getHByWRatio() * cellsSlider.value)} : r${cellsSlider.value})`
}


incrementRow.onclick = () => changeRowSize(1)
rowSlider.onchange = () => changeRowSize()
decrementRow.onclick = () => changeRowSize(-1)
rowSlider.oninput = () => rowsShower.innerHTML = `(${rowSlider.value})`

incrementCol.onclick = () => changeColSize(1)
colSlider.onchange = () => changeColSize()
decrementCol.onclick = () => changeColSize(-1)
colSlider.oninput = () => colsShower.innerHTML = `(${colSlider.value})`


id("apply-selected-data").onclick = () => {
    applySelectedPart(selectedPart)
}

function applySelectedPart(data) {
    if (!data) customAlert("Select A Part First!")
    else customConfirm("Do You Really Want To Apply Selected Data On Canvas (Your Existing Data Will Be Lost) ?", () => {
        if (!data) customAlert("Select A Part First!")
        addCanvas(data.length, data[0].length)
        applyPaintData(data.slice().flat())
        recordPaintData()
    })
}

function applySelectedPartSilent(data) {
    addCanvas(data.length, data[0].length)
    applyPaintData(data.slice().flat())
    recordPaintData()
}

const popularAspectRatios = [
    [16, 9],
    [1, 1],
    [4, 3],
    [3, 4],
    [7, 5],
    [18, 9],
    [21, 9],
    [2.39, 1],
];

const popularAspectRatiosContainer = id("popular-aspect-ratios-container")

for (let i = 0; i < popularAspectRatios.length; i++) {
    let ratioButton = document.createElement("input")
    ratioButton.setAttribute("type", "button")
    let w = popularAspectRatios[i][0]
    let h = popularAspectRatios[i][1]
    ratioButton.value = popularAspectRatios[i].length === 2 ? `${w}:${h}` + (w < h ? "" : "") : popularAspectRatios[i][2]
    popularAspectRatiosContainer.appendChild(ratioButton)
    ratioButton.onclick = () => {
        hByWRatio.value = parseFloat((w / h).toFixed(3))
        localStorageREF.setItem(B_ASPECT_RATIO, parseFloat((w / h).toFixed(3)))
    }

}

const popularPixelArtSizes = [
    [8, 8, '8-Bit'],
    [16, 16, '16-Bit'],
    [32, 32, '32-Bit'],
    [16, 16, 'Minecraft 16 : 16'],
    [64, 64, 'Standard 64'],
    [24, 24, '24-Bit'],
    [128, 128, '128-Bit'],
    [164, 164, '164-Bit'],
    [72, 72, '72-Bit'],
    [4, 4, 'Four Square']
];


const popularSizesContainer = id("popular-sizes-container")

for (let i = 0; i < popularPixelArtSizes.length; i++) {
    let sizeButton = document.createElement("input")
    sizeButton.setAttribute("type", "button")
    sizeButton.value = popularPixelArtSizes[i][2]
    popularSizesContainer.appendChild(sizeButton)
    sizeButton.onclick = () => {
        customConfirm(`You will loose your artwork if you resize, do you really want resize from (${cols}:${rows}) to (${popularPixelArtSizes[i][0]}:${popularPixelArtSizes[i][1]})?`,
            () => {
                addCanvas(popularPixelArtSizes[i][0], popularPixelArtSizes[i][1])
            })
    }
}

id("max-allowed-canvas-size").oninput = () => {
    if (id("max-allowed-canvas-size").value == "") {
        id("max-allowed-canvas-size").value = 100
    } else if (parseInt(id("max-allowed-canvas-size").value) > 250) {
        id("max-allowed-canvas-size").value = 250
    } else if (parseInt(id("max-allowed-canvas-size").value) < 1) {
        id("max-allowed-canvas-size").value = 1
    }
    setBucketVal(B_MAX_CANVAS_DIMENSION, id("max-allowed-canvas-size").value)
}

cellsSlider.max = MAX_CANVAS_DIMENSION
rowSlider.max = MAX_CANVAS_DIMENSION
colSlider.max = MAX_CANVAS_DIMENSION
