function mirrorVertically(i) {
    let px = x(i)
    let py = y(i)
    return pack(cols - px - 1, py)
}

function mirrorHorizontally(i) {
    let px = x(i)
    let py = y(i)
    return pack(px, rows - py - 1) 
}
