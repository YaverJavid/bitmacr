const exportSelector = document.getElementById("export-selector")

document.getElementById('export-button').addEventListener("click", () => exportImage())
document.getElementById('export-button2').addEventListener("click", () => exportImage())
document.getElementById("export-mini").addEventListener("click", () => exportImage(true))

id("refresh-drawing-checker").onclick = () => {
    let img = new Image(200)
    let paintData
    if (exportSelector.value == "canvas") {
        let currentBuffer = buffer.getItem()
        paintData = []
        for (let i = 0; i < currentBuffer.length; i++)
            paintData.push(rgbaToHex(currentBuffer[i]))
        paintData = toPaintData2D(paintData)
    } else if (exportSelector.value == "selected-part") {
        paintData = selectedPart
        if (!paintData) {
            customAlert("No Data Selected!")
            return
        }
    }
    img.src = colorDataToImage(
        paintData,
        cellBorderWidthSlider.value,
        cellBorderColorSelector.value
    )
    img.style.border = "1px solid var(--secondary)"
    drawingCheckerSection.removeChild(drawingCheckerSection.lastChild)
    img.classList.add('image')
    drawingCheckerSection.appendChild(img)
}


function exportImage(mini = false) {
    let paintData
    if (exportSelector.value == "canvas") {
        let currentBuffer = buffer.getItem()
        paintData = []
        for (let i = 0; i < currentBuffer.length; i++)
            paintData.push(rgbaToHex(currentBuffer[i]))
        paintData = toPaintData2D(paintData)
    } else if (exportSelector.value == "selected-part") {
        if (!selectedPart) {
            customAlert("No Data Selected!")
            return
        }
        paintData = selectedPart
    }
    let res = id('res-type').value == 'direct' ? id("export-res").value : (id("pixel-size").value * Math.max(rows, cols))
    let dataUrl = colorDataToImage(paintData, cellBorderWidthSlider.value, cellBorderColorSelector.value, mini, res)
    downloadImage(dataUrl, `pixmacr-yj-[${paintData[0].length}_${paintData.length}]`)
}

function createRunLengthEncodedSVG(matrix) {
    const height = matrix.length;
    const width = matrix[0].length;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">\n`;

    for (let y = 0; y < height; y++) {
        let currentColor = null;
        let runStartX = 0;

        for (let x = 0; x <= width; x++) {
            const color = x < width ? matrix[y][x] : null;  // Get color or null if end of row

            if (color !== currentColor) {
                if (currentColor !== null) {
                    // End of a run, add path for the previous color
                    svg += `<path stroke="${currentColor}" d="M${runStartX} ${y}h${x - runStartX}" />\n`;
                }
                currentColor = color;
                runStartX = x;
            }
        }
    }

    svg += `</svg>`;
    return svg;
}


id("export-svg").onclick = () => {
    let data = (id('export-selector').value == 'canvas') ? toPaintData2D(buffer.getItem()) : selectedPart
    if (!data) {
        customAlert('No Data Selected!')
        return
    }
    downloadText('pixmacr.svg', createRunLengthEncodedSVG(data))
}

id("export-res").oninput = () => {
    id("export-res-shower").textContent = `(${id("export-res").value})`
}

let shapeAdded = false
id("add-shape").addEventListener("input", function () {
    let file = this.files[0];
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            id("shape-preview").src = event.target.result;
            id("shape-preview").style.display = 'initial'
            shapeAdded = true
        }

    }
})

id("export-with-shape").onclick = () => {
    if (!shapeAdded) {
        customAlert("No Overlay Image Added!")
        return
    }
    let exportImage = new Image()
    let currentBuffer = buffer.getItem()
    paintData = []
    for (let i = 0; i < currentBuffer.length; i++)
        paintData.push(rgbaToHex(currentBuffer[i]))
    paintData = (id('export-selector').value == 'canvas') ? toPaintData2D(paintData) : selectedPart
    if (!paintData) {
        customAlert("Nothing Selected!!")
        return
    }
    let lx = paintData[0].length
    let ly = paintData.length
    let res = id('res-type').value == 'direct' ? id("export-res").value : (id("pixel-size").value * Math.max(rows, cols))
    exportImage.src = colorDataToImage(
        paintData,
        cellBorderWidthSlider.value,
        cellBorderColorSelector.value,
        false,
        res
    )
    let canvas = document.createElement("canvas")
    canvas.width = exportImage.naturalWidth
    canvas.height = exportImage.naturalHeight
    let ctx = canvas.getContext("2d")
    let cw = canvas.width / lx
    let shape = new Image;
    shape.src = id("shape-preview").src
    shape.onload = function () {
        ctx.drawImage(exportImage, 0, 0)
        for (let c = 0; c < lx; c++) {
            for (let r = 0; r < ly; r++) {
                if (id("add-shape-on-transparent-cells").checked || paintData[r][c] != "#00000000")
                    ctx.drawImage(shape, c * cw, r * cw, cw, cw)
            }
        }
        downloadImage(canvas.toDataURL(), "pix_shape.png")
    }
}

function toOverlays() {
    customConfirm("Do you want to leave to another site (undo date will be lost)?", () => {
        window.location.href = "/overlays"
    })
}


id("res-type").onchange = () => {
    if (id("res-type").value == 'linked') {
        id('linked-res-options').classList.remove('hidden')
        id('direct-res-options').classList.add('hidden')
    } else {
        id('direct-res-options').classList.remove('hidden')
        id('linked-res-options').classList.add('hidden')
    }
}

id('pixel-size').oninput = () => {
    let pixelSize = id('pixel-size').value
    id('linked-final-res').textContent = `${pixelSize * rows} x ${pixelSize * cols}.`
    id('pixel-size-shower').textContent = `(${pixelSize})`
}

let visibleExporter = 'png-exporter'


id('export-type').oninput = () => {
    id(visibleExporter).classList.remove('visible')
    visibleExporter = id('export-type').value + '-exporter'
    id(visibleExporter).classList.add('visible')
    if (['png-exporter', 'overlay-exporter'].includes(visibleExporter)) id('resolution-box').style.display = 'block'
    else id('resolution-box').style.display = 'none'
}


document.getElementById("export-raw-data").addEventListener("click", () => {
    if (id('export-selector').value == 'selected-part' && !selectedPart) {
        customAlert('No Data Selected!')
        return
    }
    let data = (id('export-selector').value == 'canvas') ?
        getCurrentDrawingData() :
        toRawData(selectedPart.slice().flat(), selectedPart.length, selectedPart[0].length, true)
    downloadText(drawingName.value + 'pixmacr.spad', data)
})