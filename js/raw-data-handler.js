setUpLocalStorageBucket("drawings", "{}")

let drawings = JSON.parse(localStorageREF.getItem("drawings"))

document.getElementById("raw-data-fp").addEventListener("input", function() {
    let fr = new FileReader;
    fr.onload = () => {
        let data = parseRawData(fr.result)
        if (!data) return
        addCanvas(data.rows, data.cols)
        applyPaintData(data.colorData)
        buffer.clearStack()
        recordPaintData()
    }
    fr.readAsText(this.files[0])
    this.value = null
})

function parseRawData(rawData) {
    let data, res, colorData
    try {
        data = rawData.toString().split(':')
        res = data[0].split(",")
        res = [parseInt(res[0]), parseInt(res[1])]
        colorData = verifyAndProcessRawColorArray(data[1].split(','), res[0], res[1])
    }
    catch (error) {
        customAlert("Data is corrupted!")
        return
    }
    return {
        rows: res[0],
        cols: res[1],
        colorData
    }
}

function getCurrentDrawingData() {
    return toRawData(buffer.getItem(), rows, cols)
}

function toRawData(primitiveData, rows, cols) {
    let data = ""
    data += rows + ',' + cols + ':'
    for (var i = 0; i < buffer.getItem().length; i++) {
        if (i != 0) data += ','
        if (primitiveData[i] == "rgba(0, 0, 0, 0)") {
            data += '#00000000'
            continue
        }
        data += rgbToHex(buffer.getItem()[i])
    }
    return data
}

document.getElementById("export-raw-data").addEventListener("click", () => {
    let data = getCurrentDrawingData()
    downloadText(drawingName.value + '(pixmacr).spad', data)
})

function verifyAndProcessRawColorArray(rawArray, rows, cols) {
    if (rows * cols != rawArray.length)
        customAlert("Missing Or Extra Data!")
    let result = []
    for (var i = 0; i < rawArray.length; i++)
        result.push(rawArray[i])
    return result
}





function saveCanvasAsDrawing() {
    if (drawingName.value == "") {
        customAlert("Enter The Name First!")
        return
    } else if (drawingName.value.toLowerCase() == "cid") {
        CIDSound.play()
    } else {
        saveSound.play()
    }
    let currentDrawingName = drawingName.value
    if (!(currentDrawingName in drawings)) {
        drawingsContainer.innerHTML = getDrawingHTML(currentDrawingName) + drawingsContainer.innerHTML 
        addEventListenersToSavedDrawings()
    }
    drawings[currentDrawingName] = getCurrentDrawingData()
    saveDrawings()
    drawingsContainer.children[0].scrollIntoView({behaviour: "smooth"})
}

function saveDrawings() {
    localStorageREF.setItem("drawings", JSON.stringify(drawings))
    updateNoDrawingPresentDiv()
}



function getDrawingHTML(drawingName) {
    return `<div class="drawing">
                <img class="drawing-preview image"></img>
                <p class="drawing-name">${drawingName}</p>
                <div class="drawing-icons-container">
                <img class="drawing-delete-icon image" src="icons/delete.svg">
                <img class="drawing-apply-icon image" src="icons/play.svg">
                <img class="drawing-download-icon image" src="icons/download.svg">
                <img class="drawing-preview-icon image" src="icons/see.svg"></icon>
                </div>
            </div>`
}


for (let drawingName in drawings) {
    drawingsContainer.innerHTML = getDrawingHTML(drawingName) + drawingsContainer.innerHTML 
}

addEventListenersToSavedDrawings()


function addEventListenersToSavedDrawings() {
    const drawingDeleteIcons = document.getElementsByClassName("drawing-delete-icon")
    const drawingApplyIcons = document.getElementsByClassName("drawing-apply-icon")
    const drawingNames = document.getElementsByClassName("drawing-name")
    const drawingElements = document.getElementsByClassName("drawing")
    const drawingDownloadIcons = document.getElementsByClassName("drawing-download-icon")
    const drawingPreviewIcons = document.getElementsByClassName("drawing-preview-icon")
    const drawingPreviews = document.getElementsByClassName("drawing-preview")

    for (let i = 0; i < drawingElements.length; i++) {
        let currentDrawingName = drawingNames[i].innerHTML
        drawingDeleteIcons[i].addEventListener("click", () => {
            customConfirm(`Do you really want to delete drawing "${currentDrawingName}"?`, () => {
                    delete drawings[currentDrawingName]
                    drawingElements[i].style.display = "none"
                    deleteSound.play()
                    updateNoDrawingPresentDiv()
                },
                () => {}, saveDrawings
            )
        })
        drawingApplyIcons[i].addEventListener("click", () => {
            customConfirm(
                "Do you really want to apply data, you will loose your current artwork on canvas?",
                () => {
                    let data = parseRawData(drawings[currentDrawingName])
                    addCanvas(data.rows, data.cols)
                    canvasSizeShower.textContent = `(${data.cols})`
                    cellsSlider.value = data.cols
                    applyPaintData(data.colorData)
                    if (!borderCheckbox.checked) {
                        removeBorder()
                    }
                    if (guideCheckbox.checked) {
                        addGuides()
                    }
                    recordPaintData()
                }
            )
        })
        drawingDownloadIcons[i].addEventListener("click", () => {
            customConfirm(
                "Do You Want To Download In Png Format? (Cancel To Download In Raw Data Format(spad))",
                () => {
                    let data = parseRawData(drawings[currentDrawingName])
                    let dataUrl = colorDataToImage(
                        toPaintData2D(data.colorData),
                        cellBorderWidthSlider.value,
                        cellBorderColorSelector.value
                    )
                    downloadImage(dataUrl, "yjpm-saved-.png")
                },
                () => {
                    customConfirm("Do You Want To Download In Raw Data Format Format(spad)?", () => {
                        downloadText(currentDrawingName + "(saved-pixmacr).spad", drawings[currentDrawingName])
                    })
                }
            )

        })
        drawingPreviewIcons[i].addEventListener("click", () => {
            let data = parseRawData(drawings[currentDrawingName])
            let dataUrl = colorDataToImage(
                toPaintData2D(data.colorData, data.rows, data.cols),
                cellBorderWidthSlider.value,
                cellBorderColorSelector.value
            )
            drawingPreviews[i].width = "200"
            drawingPreviews[i].src = dataUrl
        })
        drawingsContainer.children[i].children[1].ondblclick = ()=>{
            drawingName.value = drawingsContainer.children[i].children[1].innerHTML
        } 
    }
}


const flexibleDimension = document.querySelector("#flexible-dimension")
document.getElementById("image-to-pixel").addEventListener("input", function() {
    let file = this.files[0];
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
            let img = new Image();
            img.src = event.target.result;
            img.addEventListener("load", () => {
                let width, height, flexibleDimensionValue  = flexibleDimension.value 
                if(flexibleDimensionValue == "lesser") flexibleDimensionValue = img.width < img.height ? "width" : "height"
                else if(flexibleDimensionValue == "greater") flexibleDimensionValue = img.width > img.height ? "width" : "height"
                if (flexibleDimensionValue == "none") {
                    width = cols
                    height = rows
                } else if (flexibleDimensionValue == "width") {
                    height = rows
                    width = Math.round(rows * (img.width / img.height))
                } else if (flexibleDimensionValue == "height") {
                    width = cols
                    height = Math.round(cols * (img.height / img.width))
                }
                if (width != cols || height != rows) addCanvas(height, width)
                applyPaintData(imageToPixelArtData(img, width, height))
                recordPaintData()
            })
        };
        reader.readAsDataURL(file);
    }
});


function updateNoDrawingPresentDiv(){
    if(Object.keys(drawings).length === 0) id("no-drawing-present-div").style.display = "initial"
    else id("no-drawing-present-div").style.display = "none"
}

updateNoDrawingPresentDiv()