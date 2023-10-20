

id("replace-content-awarely").onclick = () => {
    let pd = toPaintData2D(buffer.getItem().slice())
    let targetColor = hexToRgbaObject(colorToBeReplaced)
    targetColor = `rgba(${targetColor.r}, ${targetColor.g}, ${targetColor.b}, ${targetColor.a})`
    applyPaintData(replaceContentAwarely(pd, targetColor).flat())
    recordPaintData()
}

function replaceContentAwarely(colorArray, targetColor) {
    // Define a function to parse RGBA color strings into an array of integers
    function parseRGBA(colorString) {
        const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
        const rgbRegex = /rgb?\((\d+),\s*(\d+),\s*(\d+)\)/;
        const rgbMatches = colorString.match(rgbRegex);
        if (rgbMatches) {
            const [, r, g, b] = rgbMatches.map(parseFloat);
            return [r, g, b, 1]; // Default alpha to 1 for RGB colors
        }
        // Check for RGBA format
        const rgbaMatches = colorString.match(rgbaRegex);
        if (rgbaMatches) {
            const [, r, g, b, a] = rgbaMatches.map(parseFloat);
            // Check if alpha (a) is provided and within the valid range, otherwise default to 1
            const alpha = typeof a !== 'undefined' ? Math.min(1, Math.max(0, a)) : 1;
            return [r, g, b, alpha];
        }

        // Check for RGB format


        return null;
    }
    // Parse the target color from RGBA string to array
    const parsedTargetColor = parseRGBA(targetColor);
    // Iterate through the 2D array of colors
    for (let i = 0; i < colorArray.length; i++) {
        for (let j = 0; j < colorArray[i].length; j++) {
            // Parse the current color from RGBA string to array
            const currentColor = parseRGBA(colorArray[i][j]);
            // Check if the current color matches the target color
            if (currentColor && currentColor[3] === parsedTargetColor[3] && currentColor.slice(0, 3).toString() === parsedTargetColor.slice(0, 3).toString()) {
                let neighborColor = null;

                // Check right neighbor
                if (j + 1 < colorArray[i].length) {
                    neighborColor = parseRGBA(colorArray[i][j + 1]);
                }

                // If right neighbor is not present or is the target color, check left neighbor
                if (!neighborColor || (neighborColor && neighborColor.slice(0, 3).toString() === parsedTargetColor.slice(0, 3).toString())) {
                    if (j > 0) {
                        neighborColor = parseRGBA(colorArray[i][j - 1]);
                    }
                }

                // If neither neighbor is available, fill with white
                if (!neighborColor) {
                    neighborColor = [255, 255, 255, 1];
                }

                // Set neighbor color as replacement color
                colorArray[i][j] = `rgba(${neighborColor.join(',')})`;

                // Check if the replacement color is still the target color and repeat the process
                if (colorArray[i][j] === targetColor) {
                    j--; // Move back one step to recheck the current pixel in the next iteration
                }
            }
        }
    }

    // Return the modified color array
    return colorArray;
}