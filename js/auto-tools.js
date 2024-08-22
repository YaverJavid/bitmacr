id("image-pixelart-to-pixel").addEventListener("input", function (event) {
    let fr = new FileReader();
    fr.onload = function () {
        let img = new Image();
        img.onload = function () {
            let canvas = document.createElement("canvas")
            canvas.height = img.height
            canvas.width = img.width
            let ctx = canvas.getContext("2d")
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(img, 0, 0)
            let imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);      
            let pixelSize = findShortestStreak(imgd)
            let ph = Math.floor(img.height/pixelSize)
            let pw = Math.floor(img.width/pixelSize)
            let th = parseInt(id("auto-size-detection-threshold").value)
            
            if (pw > (MAX_CANVAS_DIMENSION + 20) || ph > (MAX_CANVAS_DIMENSION + 20)) {
                customAlert(`Dimension Greater Than Supported! (${pw}:${ph})`)
                return
            }

            let data = imageToPixeArtData(img, pw, ph)
            addCanvas(ph, pw)
            applyPaintData(data)
            buffer.clearStack()
            recordPaintData()
        };
        img.src = fr.result;
    };

    if (this.files && this.files[0]) {
        fr.readAsDataURL(this.files[0]);

    }
    this.value = null;
})

id("auto-size-detection-threshold").oninput = () => {
    id("auto-size-detection-threshold-shower").innerHTML = `(${id("auto-size-detection-threshold").value})`
}

function findShortestStreak(imageData) {
    const { data, width, height } = imageData;
    
    // Helper function to convert pixel data to a 2D array of colors
    function getColorMatrix() {
        const matrix = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                row.push([
                    data[index],     // Red
                    data[index + 1], // Green
                    data[index + 2], // Blue
                    data[index + 3]  // Alpha
                ]);
            }
            matrix.push(row);
        }
        return matrix;
    }

    // Helper function to find the shortest streak in a line of colors
    function getShortestStreak(line) {
        let minStreak = Infinity;
        let currentColor = line[0];
        let currentStreak = 1;

        for (let i = 1; i < line.length; i++) {
            if (line[i][0] === currentColor[0] &&
                line[i][1] === currentColor[1] &&
                line[i][2] === currentColor[2] &&
                line[i][3] === currentColor[3]) {
                currentStreak++;
            } else {
                if (currentStreak > 1 && currentStreak < minStreak) {
                    minStreak = currentStreak;
                }
                currentColor = line[i];
                currentStreak = 1;
            }
        }

        // Check the last streak
        if (currentStreak > 1 && currentStreak < minStreak) {
            minStreak = currentStreak;
        }

        return minStreak === Infinity ? 0 : minStreak;
    }

    const matrix = getColorMatrix();
    let overallMinStreak = Infinity;

    // Check rows
    for (let i = 0; i < height; i++) {
        const rowStreak = getShortestStreak(matrix[i]);
        if (rowStreak < overallMinStreak) {
            overallMinStreak = rowStreak;
        }
    }

    // Check columns
    for (let j = 0; j < width; j++) {
        let column = [];
        for (let i = 0; i < height; i++) {
            column.push(matrix[i][j]);
        }
        const colStreak = getShortestStreak(column);
        if (colStreak < overallMinStreak) {
            overallMinStreak = colStreak;
        }
    }

    return overallMinStreak === Infinity ? 0 : overallMinStreak;
}