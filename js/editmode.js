let editmode = false;

let originalPaintZoneWidth = null;
let originalPaintZoneHeight = null;


let emShapes = id('em-shapes-selector').children;
let shapes = id('shapes-selector').children;

for (let i = 0; i < emShapes.length; i++) {
    emShapes[i].onclick = () => {
        shapes[i].onclick()
        for (let j = 0; j < emShapes.length; j++) {
            if (emShapes[j].classList.contains('active-shape')) {
                emShapes[j].classList.remove('active-shape')
            }

            if (shapes[j].classList.contains('active-shape')) {
                emShapes[j].classList.add('active-shape')
            }
        }
    }
}

let emColors = id('em-colors-selector').children;
let colors = id('color-m-selector').children;

for (let i = 0; i < emColors.length; i++) {
    emColors[i].onclick = () => {
        for (let j = 0; j < emColors.length; j++) {
            colors[i].onclick();

            if (emColors[j].classList.contains('active-cmode')) {
                emColors[j].classList.remove('active-cmode')
            }

            if (colors[j].classList.contains('active-cmode')) {
                emColors[j].classList.add('active-cmode')
            }
        }
    }
}



id(`cm-click-mode-fill`).onclick = ()=>{
    if(id(`cm-click-mode-fill`).classList.contains('active')) return;
    id(`cm-click-mode-cell`).classList.remove('active')
    id(`cm-click-mode-fill`).classList.add('active')
    id('click-mode-selector').onclick()
}

id(`cm-click-mode-cell`).onclick = ()=>{ 
    if(id(`cm-click-mode-cell`).classList.contains('active')) return;
    id(`cm-click-mode-fill`).classList.remove('active')
    id(`cm-click-mode-cell`).classList.add('active')
    id('click-mode-selector').onclick()
}


function launchEditMode() {
    originalPaintZoneWidth = paintZone.offsetWidth;
    originalPaintZoneHeight = paintZone.offsetHeight;

    paintZone.classList.add('paint-zone-em');
    id('paint-zone-container').classList.add('paint-zone-container-em');

    id('em-fixed-controls-left').classList.remove('invisible')
    id('em-fixed-controls-right').classList.remove('invisible')

    paintZone.classList.add('ag-paint-zone-resize')
    resizeEditmodePaintZone()

    for (let i = 0; i < emShapes.length; i++) {
        if (emShapes[i].classList.contains('active-shape')) {
            emShapes[i].classList.remove('active-shape')
        }

        if (shapes[i].classList.contains('active-shape')) {
            emShapes[i].classList.add('active-shape')
        }
    }

    for (let j = 0; j < emColors.length; j++) {
        if (emColors[j].classList.contains('active-cmode')) {
            emColors[j].classList.remove('active-cmode')
        }

        if (colors[j].classList.contains('active-cmode')) {
            emColors[j].classList.add('active-cmode')
        }
    }

    id('em-color').value = colorSelector.value;
    id(`cm-click-mode-fill`).classList.remove('active')
    id(`cm-click-mode-cell`).classList.remove('active')

    id(`cm-click-mode-${clickModeSelector.value}`).classList.add('active')
}



function exitEditMode() {
    paintZone.classList.remove('paint-zone-em');
    id('paint-zone-container').classList.remove('paint-zone-container-em');

    id('em-fixed-controls-left').classList.add('invisible')
    id('em-fixed-controls-right').classList.add('invisible')

    paintZone.classList.remove('ag-paint-zone-resize')
    window.onresize()
}


function resizeEditmodePaintZone() {
    const paintZone = document.querySelector('.ag-paint-zone-resize');
    if (!paintZone || originalPaintZoneWidth === null || originalPaintZoneHeight === null) return;

    // Use the original aspect ratio
    const aspectRatio = originalPaintZoneWidth / originalPaintZoneHeight;

    const vw = window.innerWidth - (0.2 * window.innerWidth);
    const vh = window.innerHeight;

    let targetWidth, targetHeight;

    if (vw / vh < aspectRatio) {
        // Constrain by width
        targetWidth = vw;
        targetHeight = vw / aspectRatio;
    } else {
        // Constrain by height
        targetHeight = vh;
        targetWidth = vh * aspectRatio;
    }

    const css = `
.ag-paint-zone-resize {
  width: ${Math.round(targetWidth)}px !important;
  height: ${Math.round(targetHeight)}px !important;
}
`.trim();

    let style = document.getElementById('ag-resize-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'ag-resize-style';
        document.head.appendChild(style);
    }
    style.textContent = css;

    const paintZoneWidth = window.getComputedStyle(paintZone).width;
    cellWidth = parseFloat(paintZoneWidth) / cols;
}


id('em-color').oninput = () => {
    colorSelector.value = id('em-color').value;
    colorSelector.oninput()
}