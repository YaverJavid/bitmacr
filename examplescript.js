let ox = 0
let oy = 0

for (let x = 0; x < cols; x+=3) {
    let y = Math.floor(Math.random() * rows)
    drawWrapper(drawLine, x, y, ox, oy)
    recordPaintData()
    addFrame()
    //undo()
    ox = x
    oy = y
}