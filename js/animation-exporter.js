import {
    GIFEncoder,
    quantize,
    applyPalette
} from 'https://unpkg.com/gifenc@1.0.3';

const globalFrameDelaySelector = document.getElementById("global-frame-delay")

document.getElementById("export-gif").onclick = async () => {
    if (framesContainer.children.length == 0) {
        customAlert("No Frames Present!")
        return
    }
    startProcess("Rendering Gif...")
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


