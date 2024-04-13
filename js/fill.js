function fill(a2d, x, y, main = true) {
    let xln = a2d[0].length,
        yln = a2d.length,
        xt = x,
        yt = y - 1,
        xb = x,
        yb = y + 1,
        xl = x - 1,
        yl = y,
        xr = x + 1,
        yr = y,
        currentColor = a2d[y][x],
        newColor = getCurrentSelectedColor()
    a2d[y][x] = newColor
    if (isInBounds(xt, yt, xln, yln) && a2d[yt][xt] == currentColor) a2d = fill(a2d, xt, yt, false)
    if (isInBounds(xb, yb, xln, yln) && a2d[yb][xb] == currentColor) a2d = fill(a2d, xb, yb, false)
    if (isInBounds(xl, yl, xln, yln) && a2d[yl][xl] == currentColor) a2d = fill(a2d, xl, yl, false)
    if (isInBounds(xr, yr, xln, yln) && a2d[yr][xr] == currentColor) a2d = fill(a2d, xr, yr, false)
    return a2d
        
}


let isInBounds = (x, y, xln, yln) => (x >= 0) && (x < xln) && (y >= 0) && (y < yln)

