function getIconPath(pathFromIcons) {
    if (typeof require !== "undefined") {
        const path = require('path');
        return path.join(__dirname, 'icons', pathFromIcons);
    } else {
        return `../icons/${pathFromIcons}`;
    }
}

function setIcon(elem, pathFromIconsDir) {
    elem.src = getIconPath(pathFromIconsDir)
}