function blendColors(colorTop, colorBottom, mode) {
    // Extract RGBA values from the color objects
    const { r: rTop, g: gTop, b: bTop, a: aTop } = colorTop;
    const { r: rBottom, g: gBottom, b: bBottom, a: aBottom } = colorBottom;

    // Normalize alpha values
    const aTopNormalized = aTop / 255;
    const aBottomNormalized = aBottom / 255;

    // Function to clamp values between 0 and 255
    const clamp = (value) => Math.round(Math.max(0, Math.min(255, value)));

    // Blending calculations
    let rResult, gResult, bResult, aResult;

    switch (mode) {
        case 'default':
            if (aTop == 0) {
                rResult = rBottom;
                gResult = gBottom;
                bResult = bBottom;
                aResult = aBottom;
            } else {
                rResult = rTop;
                gResult = gTop;
                bResult = bTop;
                aResult = aTop;
            }
            break
        case 'normal':
            rResult = rTop;
            gResult = gTop;
            bResult = bTop;
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;
        case 'replace':
            rResult = rTop;
            gResult = gTop;
            bResult = bTop;
            aResult = aTop;
            break;
        case 'multiply':
            rResult = rTop * rBottom / 255;
            gResult = gTop * gBottom / 255;
            bResult = bTop * bBottom / 255;
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'screen':
            rResult = 255 - (255 - rTop) * (255 - rBottom) / 255;
            gResult = 255 - (255 - gTop) * (255 - gBottom) / 255;
            bResult = 255 - (255 - bTop) * (255 - bBottom) / 255;
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'overlay':
            rResult = rTop < 128 ? (2 * rTop * rBottom / 255) : (255 - 2 * (255 - rTop) * (255 - rBottom) / 255);
            gResult = gTop < 128 ? (2 * gTop * gBottom / 255) : (255 - 2 * (255 - gTop) * (255 - gBottom) / 255);
            bResult = bTop < 128 ? (2 * bTop * bBottom / 255) : (255 - 2 * (255 - bTop) * (255 - bBottom) / 255);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;
        case 'darken':
            rResult = Math.min(rTop, rBottom);
            gResult = Math.min(gTop, gBottom);
            bResult = Math.min(bTop, bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'lighten':
            rResult = Math.max(rTop, rBottom);
            gResult = Math.max(gTop, gBottom);
            bResult = Math.max(bTop, bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'difference':
            rResult = Math.abs(rTop - rBottom);
            gResult = Math.abs(gTop - gBottom);
            bResult = Math.abs(bTop - bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'exclusion':
            rResult = rTop + rBottom - 2 * rTop * rBottom / 255;
            gResult = gTop + gBottom - 2 * gTop * gBottom / 255;
            bResult = bTop + bBottom - 2 * bTop * bBottom / 255;
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'hue':
            const [hTop, sTop, lTop] = LIB_BLEND_rgbToHsl(rTop, gTop, bTop);
            const [, sBottom, lBottom] = LIB_BLEND_rgbToHsl(rBottom, gBottom, bBottom);
            [rResult, gResult, bResult] = LIB_BLEND_hslToRgb(hTop, sBottom, lBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'saturation':
            const [hTopSat, , lTopSat] = LIB_BLEND_rgbToHsl(rTop, gTop, bTop);
            const [hBottomSat, , lBottomSat] = LIB_BLEND_rgbToHsl(rBottom, gBottom, bBottom);
            [rResult, gResult, bResult] = LIB_BLEND_hslToRgb(hTopSat, sTop, lBottomSat);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'color':
            const [hTopCol, sTopCol, lTopCol] = LIB_BLEND_rgbToHsl(rTop, gTop, bTop);
            const [, , lBottomCol] = LIB_BLEND_rgbToHsl(rBottom, gBottom, bBottom);
            [rResult, gResult, bResult] = LIB_BLEND_hslToRgb(hTopCol, sTopCol, lBottomCol);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'luminosity':
            const [, , lTopLum] = LIB_BLEND_rgbToHsl(rTop, gTop, bTop);
            const [hBottomLum, sBottomLum,] = LIB_BLEND_rgbToHsl(rBottom, gBottom, bBottom);
            [rResult, gResult, bResult] = LIB_BLEND_hslToRgb(hBottomLum, sBottomLum, lTopLum);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;
        case 'softLight':
            rResult = rTop < 128 ? (2 * rTop * rBottom / 255) + (rTop * rTop * (255 - rBottom) / 255) : Math.sqrt(rTop * (2 * rBottom - rTop));
            gResult = gTop < 128 ? (2 * gTop * gBottom / 255) + (gTop * gTop * (255 - gBottom) / 255) : Math.sqrt(gTop * (2 * gBottom - gTop));
            bResult = bTop < 128 ? (2 * bTop * bBottom / 255) + (bTop * bTop * (255 - bBottom) / 255) : Math.sqrt(bTop * (2 * bBottom - bTop));
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'hardLight':
            rResult = rBottom < 128 ? (2 * rTop * rBottom / 255) : (255 - 2 * (255 - rTop) * (255 - rBottom) / 255);
            gResult = gBottom < 128 ? (2 * gTop * gBottom / 255) : (255 - 2 * (255 - gTop) * (255 - gBottom) / 255);
            bResult = bBottom < 128 ? (2 * bTop * bBottom / 255) : (255 - 2 * (255 - bTop) * (255 - bBottom) / 255);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'pinLight':
            rResult = rTop < rBottom ? Math.max(rTop, rBottom) : Math.min(rTop, rBottom);
            gResult = gTop < gBottom ? Math.max(gTop, gBottom) : Math.min(gTop, gBottom);
            bResult = bTop < bBottom ? Math.max(bTop, bBottom) : Math.min(bTop, bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'linearBurn':
            rResult = Math.max(0, rTop + rBottom - 255);
            gResult = Math.max(0, gTop + gBottom - 255);
            bResult = Math.max(0, bTop + bBottom - 255);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'linearDodge':
            rResult = Math.min(255, rTop + rBottom);
            gResult = Math.min(255, gTop + gBottom);
            bResult = Math.min(255, bTop + bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'vividLight':
            rResult = rBottom < 128 ? Math.min(255, (rTop * 255) / (255 - rBottom)) : Math.max(0, 255 - (255 - rTop) * 255 / rBottom);
            gResult = gBottom < 128 ? Math.min(255, (gTop * 255) / (255 - gBottom)) : Math.max(0, 255 - (255 - gTop) * 255 / gBottom);
            bResult = bBottom < 128 ? Math.min(255, (bTop * 255) / (255 - bBottom)) : Math.max(0, 255 - (255 - bTop) * 255 / bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'subtract':
            rResult = Math.max(0, rTop - rBottom);
            gResult = Math.max(0, gTop - gBottom);
            bResult = Math.max(0, bTop - bBottom);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'divide':
            rResult = Math.min(255, rBottom === 0 ? 255 : rTop / rBottom * 255);
            gResult = Math.min(255, gBottom === 0 ? 255 : gTop / gBottom * 255);
            bResult = Math.min(255, bBottom === 0 ? 255 : bTop / bBottom * 255);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;

        case 'contrast':
            rResult = rTop < 128 ? (2 * rTop * rBottom / 255) : (255 - 2 * (255 - rTop) * (255 - rBottom) / 255);
            gResult = gTop < 128 ? (2 * gTop * gBottom / 255) : (255 - 2 * (255 - gTop) * (255 - gBottom) / 255);
            bResult = bTop < 128 ? (2 * bTop * bBottom / 255) : (255 - 2 * (255 - bTop) * (255 - bBottom) / 255);
            aResult = aTop + aBottom * (1 - aTop / 255);
            break;
        default:
            throw new Error('Blend mode not supported');
    }

    // Return the blended color with clamped values
    return {
        r: clamp(rResult),
        g: clamp(gResult),
        b: clamp(bResult),
        a: aResult
    };
}

// Helper functions to convert RGB to HSL and HSL to RGB
function LIB_BLEND_rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h, s;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function LIB_BLEND_hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
