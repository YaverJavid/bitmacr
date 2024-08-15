

id("replace-content-awarely").onclick= ()=>{
    let pd = toPaintData2D(buffer.getItem().slice())
    let tc = hexToRgbaObject(targetColor)
    tc = `rgba(${tc.r}, ${tc.g}, ${tc.b}, ${tc.a})`
    applyPaintData(replaceContentAwarely(pd, tc).flat())
    recordPaintData()
}

function replaceContentAwarely(colorArray, targetColor) {
    function parseRGBA(colorString) {
        const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
        const rgbRegex = /rgb?\((\d+),\s*(\d+),\s*(\d+)\)/;
        const rgbMatches = colorString.match(rgbRegex);
        if (rgbMatches) {
            const [, r, g, b] = rgbMatches.map(parseFloat);
            return [r, g, b, 1]; 
        }
        
        const rgbaMatches = colorString.match(rgbaRegex);
        if (rgbaMatches) {
            const [, r, g, b, a] = rgbaMatches.map(parseFloat);
            
            const alpha = typeof a !== 'undefined' ? Math.min(1, Math.max(0, a)) : 1;
            return [r, g, b, alpha];
        }

        


        return null;
    }
    
    const parsedTargetColor = parseRGBA(targetColor);
    
    for (let i = 0; i < colorArray.length; i++) {
        for (let j = 0; j < colorArray[i].length; j++) {
            
            const currentColor = parseRGBA(colorArray[i][j]);
            
            if (currentColor && currentColor[3] === parsedTargetColor[3] && currentColor.slice(0, 3).toString() === parsedTargetColor.slice(0, 3).toString()) {
                let neighborColor = null;

                
                if (j + 1 < colorArray[i].length) {
                    neighborColor = parseRGBA(colorArray[i][j + 1]);
                }

                
                if (!neighborColor || (neighborColor && neighborColor.slice(0, 3).toString() === parsedTargetColor.slice(0, 3).toString())) {
                    if (j > 0) {
                        neighborColor = parseRGBA(colorArray[i][j - 1]);
                    }
                }

                
                if (!neighborColor) {
                    neighborColor = [255, 255, 255, 1];
                }

                
                colorArray[i][j] = `rgba(${neighborColor.join(',')})`;

                
                if (colorArray[i][j] === targetColor) {
                    j--; 
                }
            }
        }
    }

    
    return colorArray;
}

