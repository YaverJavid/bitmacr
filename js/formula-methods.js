function first(first, ...others) {
    return first
}

function firstl(first, ...others) {
    for (let i = 0; i < others.length; i++)  console.log(others[i])
    return first
}

const fp = console.log

const avgc = (r,g,b) => (r+g+b)/3

 function y(pid){
   return pid % rows
 }

function x(pid){
     return pid/cols
}

function $(id) {
    return colorFormulaVars[id]
}

function fc(i) {
    paintCells[i].onclick()
}

function undo(){
    if (buffer.setPointer(buffer.pointer - 1))
        applyPaintData(buffer.getItem())
}

function redo(){
    if (buffer.setPointer(buffer.pointer + 1))
        applyPaintData(buffer.getItem())
}

function pack(x, y){
    return y * cols + x
}

function drawWrapper(func, ...args){
    let paintCells2d = [];
    for (let i = 0; i < paintCells.length; i++) paintCells2d.push(paintCells[i]);    
    paintCells2d = toPaintData2D(paintCells2d);
    let returnee = func(paintCells2d, ...args)
    recordPaintData()
    return returnee
}

function loop(limit, body) {
    for (let i = 0; i < limit; i++) {
        body(i)
    }
}