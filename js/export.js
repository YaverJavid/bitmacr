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
        paintData = selectedPart
    }
    let dataUrl = colorDataToImage(paintData, cellBorderWidthSlider.value, cellBorderColorSelector.value, mini, id("export-res").value)
    downloadImage(dataUrl, 'syn-pixmacr-yj.png')
}

function createSVGFromArray(colorArray, pixelSize) {
    const numRows = colorArray.length;
    const numCols = colorArray[0].length;

    let svg = `<svg width="${numCols * pixelSize}" height="${numRows * pixelSize}" xmlns="http://www.w3.org/2000/svg">`;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const color = colorArray[row][col];
            svg += `<rect x="${col * pixelSize}" y="${row * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`;
        }
    }

    svg += '</svg>';
    return svg;
}


id("export-svg").onclick = () => {
    downloadText("pixmacr.svg", createSVGFromArray(toPaintData2D(buffer.getItem()), parseInt(id("svg-pixel-size").value)))
}

id("export-res").oninput = () => {
    id("export-res-shower").textContent = `(${id("export-res").value})`
}

id("svg-pixel-size").oninput = () => {
    console.log("3");
    id("svg-pixel-size-shower").textContent = `(${id("svg-pixel-size").value})`
}
let shapeAdded = false
id("add-shape").addEventListener("input", function() {
    let file = this.files[0];
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            id("shape-preview").src = event.target.result;
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
    paintData = toPaintData2D(paintData)
    exportImage.src = colorDataToImage(
        paintData,
        cellBorderWidthSlider.value,
        cellBorderColorSelector.value,
        false,
        id("export-res").value
    )
    let canvas = document.createElement("canvas")
    canvas.width = exportImage.naturalWidth
    canvas.height = exportImage.naturalHeight
    let ctx = canvas.getContext("2d")
    let cw = canvas.width / cols
    let shape = new Image;
    shape.src = id("shape-preview").src
    shape.onload = function() {
        ctx.drawImage(exportImage, 0, 0)
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                if (id("add-shape-on-transparent-cells").checked || paintData[r][c] != "#00000000")
                    ctx.drawImage(shape, c * cw, r * cw, cw, cw)
            }
        }
        downloadImage(canvas.toDataURL(), "pix_shape.png")
    }
}

function toOverlays() {
    customConfirm("Do you want to leave to another site (undo date will be lost)?", ()=>{
        window.location.href = "/overlays"
    })
}