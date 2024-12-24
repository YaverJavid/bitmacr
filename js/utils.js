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
    return newArr.map(function (row) {
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

function hexToRGBAString(hex) {
    return colorObjectToRGBA(hexToRgbaObject(hex))
}

function convertRGBAStrToObj(rgbaStr) {
    let rgbaArr = rgbaStr.replaceAll(' ', '').split(',')
    let r = rgbaArr[0].split("(")[1]
    let g = rgbaArr[1]
    if (rgbaArr.length == 4) {
        b = rgbaArr[2]
        a = rgbaArr[3].replace(")", "")
    } else {
        b = rgbaArr[2].replace(")", "")
        a = 1
    }
    return { r: +r, g: +g, b: +b, a }
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
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
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

const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}
const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};

function hslToHex(hsl) {
    const [h, s, l] = hsl
        .match(/[\d.]+/g)
        .map((x) => parseFloat(x));
    return hslValToHex(h, s, l)
}

function hslValToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (!s) r = g = b = l;
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
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
    var r = parseInt(hex.substring(1, 3), 16) / 255;
    var g = parseInt(hex.substring(3, 5), 16) / 255;
    var b = parseInt(hex.substring(5, 7), 16) / 255;
    var cMin = Math.min(r, g, b),
        cMax = Math.max(r, g, b),
        delta = cMax - cMin,
        hue = 0,
        saturation = 0,
        lightness = 0;
    if (delta === 0) {
        hue = 0;
    } else if (cMax === r) {
        hue = ((g - b) / delta) % 6;
    } else if (cMax === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }
    hue = Math.round(hue * 60);

    if (hue < 0) {
        hue += 360;
    }

    // Calculate lightness
    lightness = (cMax + cMin) / 2;

    // Calculate saturation
    if (delta === 0) {
        saturation = 0;
    } else {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }

    // Return an object containing the HSL values
    return { hue: hue, saturation: saturation, lightness: lightness };
}

async function runScriptAsync(script) {
    const asyncScript = `(async () => { ${script} })()`;
    return await eval(asyncScript);
}

function areRGBAObjsEqual(a, b, th = 0) {
    let dr = Math.abs(a.r - b.r),
        dg = Math.abs(a.g - b.g),
        db = Math.abs(a.b - b.b)
    return dr <= th && dg <= th && db <= th && a.a == b.a
}

function isInBounds(x, y, xLength, yLength) {
    return (x >= 0) && (x < xLength) && (y >= 0) && (y < yLength);
}

function labToHex(L, A, B) {
    let y = (L + 16) / 116, x = y + A / 500, z = y - B / 200;
    x = 0.95047 * (x > 0.206893 ? x ** 3 : (x - 16 / 116) / 7.787);
    y = 1.00000 * (y > 0.206893 ? y ** 3 : (y - 16 / 116) / 7.787);
    z = 1.08883 * (z > 0.206893 ? z ** 3 : (z - 16 / 116) / 7.787);
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;
    r = r > 0.0031308 ? 1.055 * (r ** (1 / 2.4)) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * (g ** (1 / 2.4)) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * (b ** (1 / 2.4)) - 0.055 : 12.92 * b;
    r = Math.min(Math.max(0, r), 1) * 255;
    g = Math.min(Math.max(0, g), 1) * 255;
    b = Math.min(Math.max(0, b), 1) * 255;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b | 0).toString(16).slice(1)}`;
}

function hexToLab(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
    g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
    b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = x > 0.008856 ? x ** (1 / 3) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? y ** (1 / 3) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? z ** (1 / 3) : (7.787 * z) + (16 / 116);
    let L = (116 * y) - 16;
    let A = 500 * (x - y);
    let B = 200 * (y - z);
    return { L, A, B };
}

let pseudoElementForColorConversion = id("pseudo")

function cssToRGBAOrRgb(color) {
    pseudoElementForColorConversion.style.background = color
    return window.getComputedStyle(
        pseudoElementForColorConversion, true
    ).getPropertyValue("background-color")
}
