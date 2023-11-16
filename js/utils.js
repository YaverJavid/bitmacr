function hexToRgbObject(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}


function getRandColor() {
    return `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
}

function getRandHex() {
    return rgbToHex(getRandColor())
}

function getQuadrant(arr, quadrant) {
    var rows = arr.length;
    var cols = arr[0].length;
    var midRow = Math.floor(rows / 2);
    var midCol = Math.floor(cols / 2);
    if (quadrant == 1) {
        return arr.slice(0, midRow).map(row => row.slice(0, midCol));
    } else if (quadrant == 2) {
        return arr.slice(0, midRow).map(row => row.slice(midCol));
    } else if (quadrant == 3) {
        return arr.slice(midRow).map(row => row.slice(0, midCol));
    } else if (quadrant == 4) {
        return arr.slice(midRow).map(row => row.slice(midCol));
    } else {
        return null;
    }
}

function toPaintData2D(arr, row, col) {
    row = row || rows
    col = col || cols
    var result = [];
    for (var i = 0; i < row; i++) {
        result.push(arr.slice(i * col, (i + 1) * col));
    }
    return result;
}

function flip2DArrayVertically(arr) {
    var newArr = arr.slice();
    return newArr.reverse();
}

function flip2DArrayHorizontally(arr) {
    var newArr = arr.slice();
    return newArr.map(function(row) {
        return row.slice().reverse();
    });
}


function rgbToHex(str) {
    if (str.includes("rgba")) {
        return rgbaToHex(str)
    }
    str = str.replace('rgb(', '').replace(')').split(',')
    let r = parseInt(str[0])
    let g = parseInt(str[1])
    let b = parseInt(str[2])
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}




function downloadImage(dataUrl, fileName = 'pixmacr-yj-') {
    if(platform == "android"){
        cordova.plugins.DownloadManager.download(dataUrl, filename);
        return
    }
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function downloadText(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function matchNumbers(n1, n2, th) {
    if (n1 == n2) return true
    let dn = Math.abs(n1 - n2)
    return dn < th
}

function matchHexColors(c1, c2, th) {
    c1 = hexToRgbaObject(c1)
    c2 = hexToRgbaObject(c2)
    if (c1.a != c2.a) return false
    if (c1.a == 0 && c2.a == 0) return true
    return (
        matchNumbers(c1.r, c2.r, th) &&
        matchNumbers(c1.g, c2.g, th) &&
        matchNumbers(c1.b, c2.b, th)
    )
}



trimString = str => str.replace(/^\s+|\s+$/g, "");
verifyName = str => trimString(str).length > 0;

function hexToRgbaObject(hex) {
    let opacity = 1;
    if (hex.length === 9) {
        opacity = parseInt(hex.substring(7, 9), 16) / 255;
        hex = hex.substring(0, 7);
    }
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    return { r, g, b, a: opacity };
}

function colorObjectToRGBA(obj) {
    return `rgb(${obj.r},${obj.g},${obj.b},${obj.a})`
}

function convertRGBAStrToObj(rgbaStr) {
    const rgbaArr = rgbaStr.match(/\d+/g).map(Number);
    if (rgbaArr[3] == undefined) rgbaArr[3] = 1
    return { r: rgbaArr[0], g: rgbaArr[1], b: rgbaArr[2], a: rgbaArr[3] };
}

function rotateArray90Degrees(matrix, clockwise = true) {
    const rows = matrix.length;
    const columns = matrix[0].length;
    const result = [];

    for (let i = 0; i < columns; i++) {
        result.push([]);
        for (let j = clockwise ? 0 : rows - 1; j >= 0 && j < rows; j += clockwise ? 1 : -1) {
            result[i].push(matrix[j][clockwise ? columns - i - 1 : i]);
        }
    }

    return result;
}


function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}


function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

var validateHex = (str) => /^#[0-9A-F]{6}$/i.test(str)

function canvasToImage(canvas) {
    var img = new Image();
    img.src = canvas.toDataURL("image/png");
    return img;
}


function distance2d(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}



function brightenHexColor(hexColor, threshold) {
    let red = parseInt(hexColor.slice(1, 3), 16);
    let green = parseInt(hexColor.slice(3, 5), 16);
    let blue = parseInt(hexColor.slice(5, 7), 16);
    let brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    let newRed = Math.round((red + (255 - red) * threshold));
    let newGreen = Math.round((green + (255 - green) * threshold));
    let newBlue = Math.round((blue + (255 - blue) * threshold));
    newRed = Math.min(newRed, 255);
    newGreen = Math.min(newGreen, 255);
    newBlue = Math.min(newBlue, 255);
    let newHexColor = "#" + ((newRed << 16) | (newGreen << 8) | newBlue).toString(16).padStart(6, '0');
    return newHexColor;
}

function rgbaToHex(rgbaColor) {
    let rgbaValues = rgbaColor.substring(rgbaColor.indexOf('(') + 1, rgbaColor.lastIndexOf(')')).split(',');
    let r = parseInt(rgbaValues[0]);
    let g = parseInt(rgbaValues[1]);
    let b = parseInt(rgbaValues[2]);
    let a = parseFloat(rgbaValues[3]);

    let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    if (!isNaN(a)) {
        let alpha = Math.round(a * 255).toString(16);
        hex += alpha.length === 1 ? '0' + alpha : alpha;
    }
    return hex;
}


function hslToHex(hsl) {
    const [hue, saturation, lightness] = hsl
        .match(/[\d.]+/g)
        .map((x) => parseFloat(x));

    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;

    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


function rgbaObjectToHex(color) {
    const r = Math.round(color.r);
    const g = Math.round(color.g);
    const b = Math.round(color.b);
    const a = Math.round(color.a * 255);
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return "#" + hex + pad(a.toString(16), 2);
}

function pad(str, len) {
    return "0".repeat(len - str.length) + str;
}


function getHSLFromHex(hex) {
    // Convert hex to RGB
    var r = parseInt(hex.substring(1, 3), 16) / 255;
    var g = parseInt(hex.substring(3, 5), 16) / 255;
    var b = parseInt(hex.substring(5, 7), 16) / 255;

    // Find the minimum and maximum values of R, G and B
    var cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        hue = 0,
        saturation = 0,
        lightness = 0;

    // Calculate hue
    if (delta === 0) {
        hue = 0;
    } else if (cmax === r) {
        hue = ((g - b) / delta) % 6;
    } else if (cmax === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }

    hue = Math.round(hue * 60);

    if (hue < 0) {
        hue += 360;
    }

    // Calculate lightness
    lightness = (cmax + cmin) / 2;

    // Calculate saturation
    if (delta === 0) {
        saturation = 0;
    } else {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }

    // Return an object containing the HSL values
    return { hue: hue, saturation: saturation, lightness: lightness };
}