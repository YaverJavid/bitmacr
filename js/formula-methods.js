function firstl(first, ...others) {
    for (let i = 0; i < others.length; i++)  console.log(others[i])
    return first
}

const fp = console.log
const avgc = (r, g, b) => (r + g + b) / 3
const y = pid => Math.floor(pid / cols)
const x = pid => pid % cols
const $ = id => colorFormulaVars[id]
const fc = i =>  cells[i].onclick()
const pack = (x, y) => y * cols + x
const first = (first, ...others) => first

function undo() {
    if (buffer.setPointer(buffer.pointer - 1))
        applyPaintData(buffer.getItem())
}

function redo() {
    if (buffer.setPointer(buffer.pointer + 1))
        applyPaintData(buffer.getItem())
}


function drawWrapper(func, ...args) {
    let  cells2d = [];
    for (let i = 0; i <  cells.length; i++)  cells2d.push( cells[i]);
     cells2d = toPaintData2D( cells2d);
    let returnee = func( cells2d, ...args)
    recordPaintData()
    return returnee
}

function loop(limit, body) {
    for (let i = 0; i < limit; i++) body(i)
}