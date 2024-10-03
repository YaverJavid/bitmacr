const SELECTED_PALETTE_COLOR_TOKEN = "selected-palette-color"
const B_SAVED_PALETTES = "saved-palettes"
const palettes = document.getElementsByClassName("palette")
const paletteCreatorPalette = id("palette-creator-palette")
const PName = id("p-name")
const paletteSelector = id("palette-selector")
const paletteCS = id("palette-cs")
const PALETTE_LIMIT = 128
const DEFAULT_PALETTES = `{
  "Flowing Water": [
    "rgba(173, 216, 230, 1)",
    "rgba(255, 20, 147, 1)",
    "rgba(0, 255, 255, 1)",
    "rgba(255, 127, 80, 1)",
    "rgba(230, 230, 250, 1)",
    "rgba(152, 255, 152, 1)"
  ],
  "Sunset Glow": [
    "rgba(255, 94, 77, 1)",
    "rgba(255, 223, 0, 1)",
    "rgba(255, 182, 193, 1)",
    "rgba(153, 50, 204, 1)",
    "rgba(139, 0, 0, 1)"
  ],
  "Forest Hues": [
    "rgba(34, 139, 34, 1)",
    "rgba(173, 223, 173, 1)",
    "rgba(139, 69, 19, 1)",
    "rgba(135, 206, 235, 1)",
    "rgba(218, 165, 32, 1)"
  ],
  "Ocean Breeze": [
    "rgba(0, 105, 148, 1)",
    "rgba(72, 209, 204, 1)",
    "rgba(135, 206, 250, 1)",
    "rgba(70, 130, 180, 1)",
    "rgba(176, 224, 230, 1)"
  ],
  "Autumn Leaves": [
    "rgba(255, 69, 0, 1)",
    "rgba(255, 140, 0, 1)",
    "rgba(255, 215, 0, 1)",
    "rgba(210, 105, 30, 1)",
    "rgba(139, 69, 19, 1)"
  ],
  "Spring Blossom": [
    "rgba(255, 192, 203, 1)",
    "rgba(255, 182, 193, 1)",
    "rgba(255, 105, 180, 1)",
    "rgba(255, 20, 147, 1)",
    "rgba(219, 112, 147, 1)"
  ],
  "Winter Chill": [
    "rgba(176, 224, 230, 1)",
    "rgba(173, 216, 230, 1)",
    "rgba(135, 206, 250, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(70, 130, 180, 1)"
  ],
  "Desert Sunset": [
    "rgba(255, 160, 122, 1)",
    "rgba(255, 127, 80, 1)",
    "rgba(255, 99, 71, 1)",
    "rgba(255, 69, 0, 1)",
    "rgba(255, 140, 0, 1)"
  ],
  "Tropical Paradise": [
    "rgba(0, 255, 127, 1)",
    "rgba(60, 179, 113, 1)",
    "rgba(32, 178, 170, 1)",
    "rgba(0, 206, 209, 1)",
    "rgba(72, 209, 204, 1)"
  ],
  "Vintage Vibes": [
    "rgba(205, 133, 63, 1)",
    "rgba(210, 180, 140, 1)",
    "rgba(244, 164, 96, 1)",
    "rgba(222, 184, 135, 1)",
    "rgba(188, 143, 143, 1)"
  ]
}`
setUpLocalStorageBucket(B_SAVED_PALETTES, DEFAULT_PALETTES)

let savedPalettes = JSON.parse(getBucketVal(B_SAVED_PALETTES))

let savedPaletteKeys = Object.keys(savedPalettes)
for (let i = 0; i < savedPaletteKeys.length; i++) {
   if("." == savedPaletteKeys[i][0]) delete savedPalettes[savedPaletteKeys[i]]
}

for (let prop in savedPalettes) {
    let option = document.createElement("option")
    option.textContent = prop
    option.value = prop
    paletteSelector.add(option)
}


for (let i = 0; i < palettes.length; i++) {
    if (palettes[i].dataset.onlyShow != "true")
        addEventListenerOnPallete(palettes[i])
}
let paletteIndex = 0

function addEventListenerOnPallete(palette) {
    for (let j = 0; j < palette.children.length; j++) {
        if (palette.children[j].classList.contains(SELECTED_PALETTE_COLOR_TOKEN))
            palette.children[j].classList.remove(SELECTED_PALETTE_COLOR_TOKEN)
    }
    for (let i = 0; i < palette.children.length; i++) {
        palette.selected = palette.children[palette.children.length - 1]
        palette.selected.classList.add(SELECTED_PALETTE_COLOR_TOKEN)
        palette.children[i].onclick = () => {
            paletteIndex = i   
            for (let j = 0; j < palette.children.length; j++) {
                if (palette.children[j].classList.contains(SELECTED_PALETTE_COLOR_TOKEN))
                    palette.children[j].classList.remove(SELECTED_PALETTE_COLOR_TOKEN)
            }
            palette.children[i].classList.toggle(SELECTED_PALETTE_COLOR_TOKEN)
            palette.selected = palette.children[i]
        }

    }
}

function addColorToPaletteManager(color) {
    if (paletteCreatorPalette.children.length == PALETTE_LIMIT) {
        customAlert("Cannot Add More Colours, Reached Limit : " + PALETTE_LIMIT + " !")
        return
    }
    const newColor = document.createElement("div")
    newColor.style.background = color ? color : getRandColor()
    paletteCreatorPalette.appendChild(newColor)
    addEventListenerOnPallete(paletteCreatorPalette)
}

document.getElementById("p-add-new-color").onclick = () => {
    addColorToPaletteManager()
}

document.getElementById("change-palette-creator-css-color").addEventListener("input", function() {
    paletteCreatorPalette.selected.style.background = this.value
})

document.getElementById("change-palette-creator-color").addEventListener("input", function() {
    paletteCreatorPalette.selected.style.background = this.value
})

document.getElementById("p-remove-selected-color").onclick = () => {
    if (paletteCreatorPalette.children.length == 1) {
        customAlert("Cannot Remove, It's The Only Color That's Present!")
        return
    }
    paletteCreatorPalette.removeChild(paletteCreatorPalette.selected)
    addEventListenerOnPallete(paletteCreatorPalette)
}

document.getElementById("save-palette").onclick = () => {
    PName.value = PName.value.trim()
    if (PName.value == "") {
        customAlert("Enter Palette Name First!")
        return
    }
    let palette = []
    for (let i = 0; i < paletteCreatorPalette.children.length; i++) {
        palette.push(window.getComputedStyle(paletteCreatorPalette.children[i]).getPropertyValue("background-color"))
    }
    if (!savedPalettes.hasOwnProperty(PName.value)) {
        let option = document.createElement("option")
        option.textContent = PName.value
        option.value = PName.value
        paletteSelector.add(option)
    }
    savedPalettes[PName.value] = palette
    updatePaletteSelector()
    if(PName.value[0] == ".") customAlert("The palette has been TEMPORARILY SAVED, slated for vanishing upon page refresh. Palette titles prefixed with a dot (.) are earmarked as provisional. Kindly expunge the dot (.) if its impermanence wasn't your intention!")
    else customAlert("The Palette Has Been Saved!")
}

paletteSelector.oninput = () => {
    updatePaletteSelector()
    paletteSequenceIndex = 0
}

function updatePaletteSelector() {
    let palette = savedPalettes[paletteSelector.value]
    paletteCS.innerHTML = ""
    for (let i = 0; i < palette.length; i++) {
        let colorElem = document.createElement("div")
        colorElem.style.background = palette[i]
        paletteCS.appendChild(colorElem)
    }
    addEventListenerOnPallete(paletteCS)
    paletteIndex = paletteCS.children.length - 1   
}

function deleteSelectedPalette() {
    if (Object.keys(savedPalettes).length > 1) {
        customConfirm(`Do You Really Want To Delete Palette ${paletteSelector.value}?`,
            () => {
                delete savedPalettes[paletteSelector.value]
                for (let i = 0; i < paletteSelector.children.length; i++) {
                    if (paletteSelector.children[i].value == paletteSelector.value) {
                        paletteSelector.removeChild(paletteSelector.children[i])
                        break
                    }
                }
                paletteSelector.value = Object.keys(savedPalettes)[0]
                updatePaletteSelector()
            })
    } else {
        customAlert("Atleast One Palette Should Remain!")
    }
}


id("p-copy-selected").onclick = () => {
    paletteCreatorPalette.innerHTML = ""
    let selectedPalette = savedPalettes[paletteSelector.value]
    for (let i = 0; i < selectedPalette.length; i++) {
        let color = document.createElement("div")
        color.style.backgroundColor = selectedPalette[i]
        paletteCreatorPalette.appendChild(color)
    }
    addEventListenerOnPallete(paletteCreatorPalette)
}

id("p-extract-from-canvas").onclick = () => {
    let allUniqueColorsFromCanvas = Array.from(new Set(buffer.getItem().slice()))
    allUniqueColorsFromCanvas.forEach(color => addColorToPaletteManager(color))
}