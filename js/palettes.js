const SELECTED_PALETTE_COLOR_TOKEN = "selected-palette-color"
const B_SAVED_PALETTES = "saved-palettes"
const palettes = document.getElementsByClassName("palette")
const paletteCreatorPalette = id("palette-creator-palette")
const PName = id("p-name")
const paletteSelector = id("palette-selector")
const paletteCS = id("palette-cs")
setUpLocalStorageBucket(B_SAVED_PALETTES, '{"Pop4 (Default)":["red","cyan","#447090","deeppink"]}')

let savedPalettes = JSON.parse(getBucketVal(B_SAVED_PALETTES))


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

function addEventListenerOnPallete(palette) {
    for (let j = 0; j < palette.children.length; j++) {
        if (palette.children[j].classList.contains(SELECTED_PALETTE_COLOR_TOKEN))
            palette.children[j].classList.remove(SELECTED_PALETTE_COLOR_TOKEN)
    }
    for (let i = 0; i < palette.children.length; i++) {
        palette.selected = palette.children[palette.children.length - 1]
        palette.selected.classList.add(SELECTED_PALETTE_COLOR_TOKEN)
        palette.children[i].onclick = () => {
            for (let j = 0; j < palette.children.length; j++) {
                if (palette.children[j].classList.contains(SELECTED_PALETTE_COLOR_TOKEN))
                    palette.children[j].classList.remove(SELECTED_PALETTE_COLOR_TOKEN)
            }
            palette.children[i].classList.toggle(SELECTED_PALETTE_COLOR_TOKEN)
            palette.selected = palette.children[i]
        }

    }
}

document.getElementById("p-add-new-color").onclick = () => {
    if (paletteCreatorPalette.children.length == 15) {
        customAlert("Cannot Add More Colours, Reached Limit : 15 !")
        return
    }
    const newColor = document.createElement("div")
    newColor.style.background = getRandColor()
    paletteCreatorPalette.appendChild(newColor)
    addEventListenerOnPallete(paletteCreatorPalette)
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
    customAlert("The Palette Has Been Saved!")
}

paletteSelector.oninput = () => {
    updatePaletteSelector()
}

window.addEventListener("unload", () => {
    localStorageREF.setItem(B_SAVED_PALETTES, JSON.stringify(savedPalettes))
})

function updatePaletteSelector() {
    let palette = savedPalettes[paletteSelector.value]
    paletteCS.innerHTML = ""
    for (let i = 0; i < palette.length; i++) {
        let colorElem = document.createElement("div")
        colorElem.style.background = palette[i]
        paletteCS.appendChild(colorElem)
    }
    addEventListenerOnPallete(paletteCS)
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
