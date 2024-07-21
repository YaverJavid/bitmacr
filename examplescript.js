let ox = 0
let oy = 0

for (let x = 0; x < cols; x+=3) {
    let y = Math.floor(Math.random() * rows)
    drawWrapper(drawLine, x, y, ox, oy)
    drawWrapper(drawLine, x, rows-1, x, y)
    fc(pack(x-1, rows-1))
    recordPaintData()
    addFrame()
    //undo()
    ox = x
    oy = y
}