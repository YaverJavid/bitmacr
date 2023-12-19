class Color {
    constructor(cssColorString) {
        this.main = this.cssColorStringToRGBOrRGBA(cssColorString)
        this.value = this.main
    }
    static cssColorStringToRGBOrRGBA(cssColorString) {
        psedoElem.style.background = cssColorString
        return window.getComputedStyle(psedoElem).getPropertyValue("background")
    }
    toHex() {
        let rgbaValues = this.main.substring(this.main.indexOf('(') + 1, this.main.lastIndexOf(')')).split(',');
        let r = parseInt(rgbaValues[0]);
        let g = parseInt(rgbaValues[1]);
        let b = parseInt(rgbaValues[2]);
        let a = parseFloat(rgbaValues[3]);

        let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

        if (!isNaN(a)) {
            let alpha = Math.round(a * 255).toString(16);
            hex += alpha.length === 1 ? '0' + alpha : alpha;
        }
        this.value = hex
    }

}


const fillGap = id("fill-gap")
const fillCount = id("fill-count")
const fillAlternate = id("fill-alternate")
const flipFillOnlyIfType = id("flip-fill-only-if-type")
const onlyFillMatchingThreshold = id("only-fill-matching-threshold")
const normalColorUnit = id("normal-color-unit")
const colorSelectorUnits = id("color-selector-unit").children
const VISIBLE_CS_TOKEN = "visible-color-selector"
const hueColorShower = id("hue-color-shower")
const randomFrom = id("random-from")
const opacity = id("opacity")
const opacityShower = id("opacity-shower")
let hue = 0
let prevOpacity = 1

opacity.oninput = () => {
    opacityShower.textContent = `(${opacity.value})`

    customConfirm(`Do You Want To Change Opacity From ${prevOpacity} to ${opacity.value}?`, () => {
        prevOpacity = opacity.value
    }, () => {
        opacity.value = prevOpacity
        opacityShower.textContent = `(${prevOpacity})`
    })
}

function updateHueShower() {
    hueAngleShower.innerHTML = `(${hueAngle.value}&deg;)`
}

let psedoElementForColorConversion = id("psedo")

function cssToRGBAOrRgb(color) {
    psedoElementForColorConversion.style.background = color
    return window.getComputedStyle(
        psedoElementForColorConversion, true
    ).getPropertyValue("background-color")
}

function getCurrentSelectedColor(preview = false) {
    let colorMods = colorMSelector.value
    if (colorMods == "random") {
        switch (randomFrom.value) {
            case "all":
                color = rgbToHex(getRandColor())
                break;
            case "color-history":
                if (usedColors.length == 0) {
                    customAlert("No Color Present In Color History!")
                    color = currentSelectedColor
                }
                color = usedColors[Math.floor(Math.random() * usedColors.length)]
                break;
            case "selected-palette":
                color = rgbToHex(cssToRGBAOrRgb(savedPalettes[paletteSelector.value][Math.floor(Math.random() * savedPalettes[paletteSelector.value].length)]));
                break;
        }

    }
    else if (colorMods == "hsl") {
        let currentHue;
        if (!preview) hue += parseFloat(hueSpeedSlider.value)
        let decimalPart = hue - Math.floor(hue)
        currentHue = (hue % 360) + decimalPart
        if (!preview) hueAngle.value = currentHue
        updateHueShower()
        if (!preview) updateHueColorShower()
        color = hslToHex(`hsl(${currentHue},${saturationSlider.value}%,${lightingSlider.value}%)`)
    }
    else if (colorMods == "eraser")
        color = '#00000000'
    else if (colorMods == "css-color")
        color = rgbToHex(cssToRGBAOrRgb(colorStringInput.value));
    else if (colorMods == "palette")
        color = rgbToHex(window.getComputedStyle(paletteCS.selected).getPropertyValue("background"))
    else if (colorMods == "formula") {

        if (colorFormulaTypeSelector.value == "hsl") {
            let hue = evalFormula(id("cf-hsl-hue").value, colorFormulaVars)
            let saturation = evalFormula(id("cf-hsl-saturation").value, colorFormulaVars)
            let lightness = evalFormula(id("cf-hsl-lightness").value, colorFormulaVars)
            if (hue === undefined || saturation === undefined || lightness === undefined)
                color = "#000000"
            else color = hslToHex(`hsl(${hue},${saturation},${lightness})`)
        } else if (colorFormulaTypeSelector.value = "rgb") {
            let r = evalFormula(id("cf-rgb-r").value, colorFormulaVars)
            let g = evalFormula(id("cf-rgb-g").value, colorFormulaVars)
            let b = evalFormula(id("cf-rgb-b").value, colorFormulaVars)
            if (r === undefined || g === undefined || b === undefined)
                color = "#000000"
            else color = rgbaToHex(`rgba(${r}, ${g}, ${b}, 1)`).slice(0, 7)
        }
        [...id("vars").children].forEach((elem) => {
            let name = elem.children[2].value
            let changeAssignmentOperator = elem.children[6].value
            let change = elem.children[7].value

            let maxPossibleValue = elem.children[9].value == "" ? Infinity : parseFloat(elem.children[9].value)
            let baseValue = elem.children[13].value == "" ? 0 : parseFloat(elem.children[13].value)
            let minPossibleValue = elem.children[11].value == "" ? -Infinity : parseFloat(elem.children[11].value)
            switch (changeAssignmentOperator) {
                case "+=":
                    colorFormulaVars[name] += evalFormula(change, colorFormulaVars)
                    break
                case "-=":
                    colorFormulaVars[name] -= evalFormula(change, colorFormulaVars)
                    break
                case "*=":
                    colorFormulaVars[name] *=evalFormula(change, colorFormulaVars)
                    break
                case "/=":
                    colorFormulaVars[name] /= evalFormula(change, colorFormulaVars)
                    break
                case "=":
                    colorFormulaVars[name] = evalFormula(change, colorFormulaVars)
                    break
            }
            if (colorFormulaVars[name] > maxPossibleValue) colorFormulaVars[name] = baseValue
            if (colorFormulaVars[name] < minPossibleValue) colorFormulaVars[name] = baseValue
            elem.children[4].value = colorFormulaVars[name]
            elem.children[4].style.width = elem.children[4].value.length + "ch";
        })
    }
    else
        color = currentSelectedColor
    let opacityHex = Math.round(opacity.value * 255).toString(16).padStart(2, '0')
    if (color.length != 9) color += opacityHex
    return slightVariationsCheckbox.checked ? slightlyDifferentColor(color) : color
}

colorStringInput.oninput = () => {
    id("css-color-string-shower").style.background = colorStringInput.value

}

hueSpeedSlider.oninput = updateHueSpeedShower

function updateHueSpeedShower() {
    hueSpeedShower.innerHTML = `(${hueSpeedSlider.value}&deg;)`
}

setupSliderWithButtons(id("m-hue-speed"), id("p-hue-speed"), hueSpeedSlider, 0.1, 0.1, updateHueSpeedShower, updateHueSpeedShower)

lightingSlider.addEventListener("input", () => {
    updateHueColorShower()
    lightingShower.innerHTML = `(${lightingSlider.value}%)`
})

saturationSlider.addEventListener("input", () => {
    updateHueColorShower()
    saturationShower.innerHTML = `(${saturationSlider.value}%)`
})

colorVariationThSlider.addEventListener("input", () => {
    updateHueColorShower()
    colorVariationThShower.innerHTML = `(${colorVariationThSlider.value})`
})

hueAngle.addEventListener("input", () => {
    updateHueColorShower()

    updateHueShower()
    hue = parseFloat(hueAngle.value)
})

function slightlyDifferentColor(hexColor, th = 24) {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const rVariation = Math.floor(Math.random() * (th + 1)) - th / 2;
    const gVariation = Math.floor(Math.random() * (th + 1)) - th / 2;
    const bVariation = Math.floor(Math.random() * (th + 1)) - th / 2;
    const newR = Math.min(Math.max(r + rVariation, 0), 255);
    const newG = Math.min(Math.max(g + gVariation, 0), 255);
    const newB = Math.min(Math.max(b + bVariation, 0), 255);
    const newHexColor = '#' + ((1 << 24) + (Math.floor(newR) << 16) + (Math.floor(newG) << 8) + Math.floor(newB)).toString(16).slice(1);
    const opacity = hexColor.length === 9 ? hexColor.substring(7, 9) : null;
    return opacity ? newHexColor + opacity : newHexColor;
}
var skips = 0
var fillCounts = 1

function setCellColor(cellElem, color) {
    if (fillAlternate.checked && skips > 0) {
        skips--;
        return;
    }
    if (fillAlternate.checked && fillCounts > 0) {
        fillCell(cellElem, color)
        fillCounts--;
    } else if (!fillAlternate.checked) {
        fillCell(cellElem, color)
    }
    else {
        skips = parseInt(fillGap.value) - 1;
        fillCounts = parseInt(fillCount.value);
    }

}

onlyFillIfColorIsCheckbox.oninput = () => {
    id("info-fill-rule").textContent = onlyFillIfColorIsCheckbox.checked ? "[FILL RULE ON]," : "fill rule off,"
    if (onlyFillIfColorIsCheckbox.checked) {
        id("info-fill-rule").style.color = "red"
    } else {
        id("info-fill-rule").style.color = "var(--primary)"
    }

}

function fillCell(cellElem, color) {
    let currentColor = rgbaToHex(window.getComputedStyle(cellElem).getPropertyValue('background-color'))
    let fillOnlyIfColorsAre = fillOnlyThisColor.value.split("||")
    let flipFillOnlyIf = flipFillOnlyIfType.value == "If"
    let th = onlyFillMatchingThreshold.value
    for (let i = 0; i < fillOnlyIfColorsAre.length; i++) {
        fillOnlyIfColorsAre[i] = rgbaToHex(cssToRGBAOrRgb(fillOnlyIfColorsAre[i]))
    }

    if (onlyFillIfColorIsCheckbox.checked) {
        if (flipFillOnlyIf) {
            if (!checkIfColorInArray(fillOnlyIfColorsAre, currentColor, th))
                return
        } else {
            if (checkIfColorInArray(fillOnlyIfColorsAre, currentColor, th))
                return
        }
    }
    cellElem.style.background = color
}

function checkIfColorInArray(array, color, th = 100) {
    for (let i = 0; i < array.length; i++)
        if (matchHexColors(array[i], color, th)) return true
    return false
}


flipFillOnlyIfType.onclick = () => {
    if (flipFillOnlyIfType.value == "If")
        flipFillOnlyIfType.value = "If Not"
    else
        flipFillOnlyIfType.value = "If"
}

onlyFillMatchingThreshold.oninput = () => {
    id("only-fill-matching-threshold-shower").textContent = onlyFillMatchingThreshold.value == 0 ? "(Exact Match)" : `(${onlyFillMatchingThreshold.value})`
}

setupNumInputWithButtons(id("minus-fill-count"), id("plus-fill-count"), fillCount, 1, 1, false)


function hideAllCS() {
    for (let i = 0; i < colorSelectorUnits.length; i++) {
        if (colorSelectorUnits[i].classList.contains(VISIBLE_CS_TOKEN))
            colorSelectorUnits[i].classList.remove(VISIBLE_CS_TOKEN)
    }
}


function refreshColorMode() {

    hideAllCS()
    let wasColorSelectorFound = false
    for (let i = 0; i < colorSelectorUnits.length; i++) {
        if (colorSelectorUnits[i].dataset.csname == colorMSelector.value) {
            colorSelectorUnits[i].classList.add(VISIBLE_CS_TOKEN)
            wasColorSelectorFound = true
            break
        }
    }
    if (!wasColorSelectorFound) colorSelectorUnits[0].classList.add(VISIBLE_CS_TOKEN)
    if (colorMSelector.value == "palette") {
        if (Object.keys(savedPalettes).length != 0) {
            updatePaletteSelector()
        }
    }
    updateHueColorShower()

}


function updateHueColorShower() {
    hueColorShower.value = getCurrentSelectedColor(true).slice(0, 7)
}

hueColorShower.oninput = () => {
    let selectedHsl = getHSLFromHex(hueColorShower.value)
    saturationSlider.value = 100 * selectedHsl.saturation
    saturationShower.textContent = `(${saturationSlider.value}%)`
    lightingSlider.value = 100 * selectedHsl.lightness
    lightingShower.textContent = `(${lightingSlider.value}%)`
    hueAngle.value = selectedHsl.hue
    hueAngleShower.innerHTML = `(${selectedHsl.hue}&deg;)`
}

const ACTIVE_CMODE_CTOKEN = "active-cmode"
const colorMSelector = id("color-m-selector")
const cmodes = colorMSelector.children
colorMSelector.value = cmodes[0].dataset.value

function removeHintFromCmodes() {
    for (let i = 0; i < cmodes.length; i++) {
        if (cmodes[i].classList.contains(ACTIVE_CMODE_CTOKEN))
            cmodes[i].classList.remove(ACTIVE_CMODE_CTOKEN)
    }
}


for (let i = 0; i < cmodes.length; i++) {
    cmodes[i].onclick = () => {
        removeHintFromCmodes()
        mouseClickSound.play()
        cmodes[i].classList.add(ACTIVE_CMODE_CTOKEN)
        colorMSelector.value = cmodes[i].dataset.value
        refreshColorMode()
    }
}