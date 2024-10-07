function getWorkingPath(pathFromGlobal) {
    if (typeof require !== "undefined") {
        const path = require('path');
        return path.join(__dirname, pathFromGlobal);
    } else {
        return `../${pathFromGlobal}`;
    }
}