import {
    GIFEncoder,
    quantize,
    applyPalette
} from './externallibs/gifenc.js';


const globalFrameDelaySelector = document.getElementById("global-frame-delay")

document.getElementById("export-gif").onclick = async () => {
    if (framesContainer.children.length == 0) {
        customAlert("No Frames Present!")
        return
    }
    startProcess(`Rendering Gif... (Total Frames : ${framesContainer.children.length})`)
    let gif = new GIFEncoder()
    const format = "rgb444";
    for (let i = 0; i < framesContainer.children.length; i++) {
        const frame = framesContainer.children[i].children[0]
        const img = new Image(frame.naturalWidth, frame.naturalHeight)
        img.src = frame.src
        const data = imageToRGBAUint8Array(img)
        const palette = quantize(data, 256, { format });
        const index = applyPalette(data, palette, format);
        const delaySelector = framesContainer.children[i].children[1].children[5]
        const delay = delaySelector.value.trim() == "" ?
            (globalFrameDelaySelector.value.trim() == "" ? 100 :
                parseFloat(globalFrameDelaySelector.value)) :
            parseFloat(delaySelector.value)
        gif.writeFrame(index, img.width, img.height, { palette, delay });
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    gif.finish()
    
    const buffer = gif.bytesView();
    download(buffer, 'animation.gif', { type: 'image/gif' });
    endProcess()
}

function imageToRGBAUint8Array(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    return imageData.data
}

function download(buf, filename, type) {
    const blob = buf instanceof Blob ? buf : new Blob([buf], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
};

function toSprite(...frames){
    let spriteWidth = 0
    let spriteHeight = 0
    for (let i = 0; i < frames.length; i++){
        spriteWidth += frames[i].width
        spriteHeight = Math.max(spriteHeight, frames[i].height)
    }
    let canvas = document.createElement('canvas')
    canvas.width = spriteWidth
    canvas.height = spriteHeight
    let ctx = canvas.getContext("2d")
    let widthPointer = 0
    for (let i = 0; i < frames.length; i++){
        ctx.drawImage(frames[i], widthPointer, 0)
        widthPointer += frames[i].width
    }
    return canvas.toDataURL()
}

id("export-sprite").onclick = ()=>{
    let frames = []
    for (let i = 0; i < framesContainer.children.length; i++) {
        const frame = framesContainer.children[i].children[0]
        const img = new Image(frame.naturalWidth, frame.naturalHeight)
        img.src = frame.src
        frames.push(img)
    }
    let sprite = toSprite(...frames)
    downloadImage(sprite, `pixmacr-sprite[${frames.length}frames]`)
}