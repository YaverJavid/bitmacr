const framesContainer = id("frames")
const frameCount = id("frame-count")
const frameCountTop = id("frame-count-top")
const autoTraceLastFrame = id("auto-trace-last-frame")
const updateFrameCount = () => {
    frameCount.textContent = framesContainer.children.length
    frameCountTop.textContent = `frames:${frameCount.textContent},`
}
const animationBackgroundsColor = ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6", "#1ABC9C", "#E67E22", "#2980B9", "#27AE60", "#D35400"];

function deleteFrame(elem) {
    let frameElem = elem.parentNode.parentNode
    customConfirm("Do you really want to delete this frame?",
        () => {
            framesContainer.removeChild(frameElem)
            updateFrameCount()
        })
}

function getFrameHTML(src) {
    return `<div class="frame" style="background: ${animationBackgroundsColor[Math.floor(Math.random() * animationBackgroundsColor.length)]}">
                <img src="${src}" class="frame-preview" width="100">
                <div class="frame-buttons">
                    <img src="icons/duplicate.svg" onclick="duplicateFrame(this)">
                    <img src="icons/up.svg" onclick="moveFrameUp(this)">
                    <img src="icons/down.svg" onclick="moveFrameDown(this)">
                    <img src="icons/delete.svg" onclick="deleteFrame(this)">
                    <img src="icons/trace.png" width=50 onclick="addFrameAsTrace(this)"> 
                    <input type="number" class="frame-time" placeholder="Enter Time(ms)" />
                </div>
            </div>`
}

document.getElementById("add-frame").onclick = addFrame

function addFrame() {
    let currentBuffer = buffer.getItem()
    let paintData = []
    for (let i = 0; i < currentBuffer.length; i++) {
        paintData.push(rgbaToHex(currentBuffer[i]))
    }
    let dataUrl = colorDataToImage(toPaintData2D(paintData), cellBorderWidthSlider.value, cellBorderColorSelector.value)
    framesContainer.innerHTML += getFrameHTML(dataUrl)
    updateFrameCount()
    if (autoTraceLastFrame.checked) {
        addFrameAsTrace(framesContainer.children[framesContainer.children.length - 1].children[1].children[4])
    }
    if (id("auto-fallback-to-background").checked) {
        if (animationBackground != undefined && (cols* rows == animationBackground.length)) {
            applyPaintData(animationBackground)
            recordPaintData()
        }
    }
}

function moveFrameUp(elem) {
    let frame = elem.parentNode.parentNode
    let currentFrameIndex = Array.prototype.indexOf.call(framesContainer.children, frame);
    if (currentFrameIndex == 0) {
        customAlert("Can't Move Up! No Frame On Top!")
        return
    }
    framesContainer.removeChild(elem.parentNode.parentNode)
    framesContainer.insertBefore(frame, framesContainer.children[currentFrameIndex - 1]);
}

function moveFrameDown(elem) {
    let frame = elem.parentNode.parentNode
    let currentFrameIndex = Array.prototype.indexOf.call(framesContainer.children, frame);
    if (currentFrameIndex + 1 == framesContainer.children.length) {
        customAlert("Can't Move Down! No Frame On Bottom!")
        return
    }
    framesContainer.removeChild(frame)
    framesContainer.children[currentFrameIndex].insertAdjacentElement("afterend", frame);

}

function duplicateFrame(elem) {
    let frame = elem.parentNode.parentNode;
    let duplicateFrame = frame.cloneNode(true);
    duplicateFrame.style.background = animationBackgroundsColor[Math.floor(Math.random() * animationBackgroundsColor.length)]
    frame.after(duplicateFrame);
    updateFrameCount();
}

function deleteAllFrames() {
    customConfirm("Do You Really Want To Delete All Frames?", () => {
        framesContainer.innerHTML = ""
        updateFrameCount()
    })
}

function addFrameAsTrace(elem) {
    let frameImg = elem.parentNode.parentNode.children[0]
    let base64String = frameImg.src
    root.style.setProperty("--trace-image", `url(${base64String})`);
}



// SECTION : ANIMATION OPTIONS

let animationBackground = undefined

const addCanvasAsBackground = id("add-canvas-as-background")

addCanvasAsBackground.onclick = () => {
    animationBackground = buffer.getItem().slice()
    let convertedData = []
    for (let i = 0; i < animationBackground.length; i++) {
        convertedData.push(rgbaToHex(animationBackground[i]))
    }
    id("animation-background-shower").src = colorDataToImage(toPaintData2D(convertedData))
    id("animation-background-shower").style.border = "1px solid black"
}