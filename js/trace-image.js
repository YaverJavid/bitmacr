const fpTraceImage = document.getElementById("fp-trace-image");
const traceImageOpacity = document.getElementById("trace-image-opacity");
const paintZoneOpacity = document.getElementById("paint-zone-opacity");

fpTraceImage.addEventListener("input", function() {
    let file = this.files[0];
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
            root.style.setProperty("--trace-image", `url(${event.target.result})`);
        };
        reader.readAsDataURL(file);
    }
});


traceImageOpacity.oninput = ()=>{
    root.style.setProperty("--trace-image-opacity", traceImageOpacity.value + "%")
}
paintZoneOpacity.oninput = ()=>{
    for (let i = 0; i < paintCells.length; i++) {
        paintCells[i].style.opacity = paintZoneOpacity.value + "%"
    }
}