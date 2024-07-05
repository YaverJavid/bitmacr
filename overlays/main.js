"use strict";
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById('fileInput');
const downloadLink = document.getElementById('downloadLink');

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const image = new Image();
            image.src = event.target.result;
            image.onload = () => {
                canvas.height = image.height;
                canvas.width = image.width;
                ctx.drawImage(image, 0, 0);
                let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < imgd.data.length; i += 4) {
                    let r = imgd.data[i];
                    let g = imgd.data[i + 1];
                    let b = imgd.data[i + 2];
                    let l = (0.3 * r) + (0.587 * g) + (0.114 * b);
                    imgd.data[i] = 0;
                    imgd.data[i + 1] = 0;
                    imgd.data[i + 2] = 0;
                    imgd.data[i + 3] = imgd.data[i + 3]  == 0 ? 0 : (255-l)
                }
                ctx.putImageData(imgd, 0, 0);

                // Create a download link for the processed image
                downloadLink.href = canvas.toDataURL('image/png');
                downloadLink.style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("randomise-bg").onclick = ()=>{
    document.body.style.backgroundColor = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`
}