if (!localStorageREF.getItem("pixm_theme")) {
    localStorageREF.setItem("pixm_theme", "#ffffff,#000000,#ffffff")
}

// BACKWARDS COMPATIBILITY 
if ((localStorageREF.getItem("pixm_theme").length - localStorageREF.getItem("pixm_theme").replaceAll(",", "").length) == 2) localStorageREF.setItem("pixm_theme", localStorageREF.getItem("pixm_theme") + ",false")


let currentTheme = localStorageREF.getItem("pixm_theme").split(",")
setTheme(currentTheme[0], currentTheme[1], currentTheme[2], currentTheme[3] === "true")

function setTheme(accent, primary, secondary, iconsInverted = false) {
    if (accent == "#00000000") root.style.setProperty("--frostblur", "blur(6px)")
    else root.style.setProperty("--frostblur", "blur(0px)")
    setSecondaryColor(secondary)
    setAccentColor(accent)
    setPrimaryColor(primary)
    root.style.setProperty("--shadow-color", iconsInverted ? "white" : "gray")
    changeCellBorderColor(secondary)
    localStorageREF.setItem("pixm_theme", `${accent},${primary},${secondary},${iconsInverted}`)
    borderColor = "#" + getPrimaryColor().slice(1)
    changeCellBorderColor(borderColor)
    handleIconInvertion(iconsInverted)
    adstrip.style.color = iconsInverted ? "#ffffff" : "#000000"
}

borderColor = "#" + getPrimaryColor().slice(1)
changeCellBorderColor(borderColor)

class Theme {
    constructor(accent, primary, secondary, name, iconsInverted = false) {
        this.accent = accent,
            this.secondary = secondary,
            this.name = name,
            this.primary = primary,
            this.iconsInverted = iconsInverted,
            this.htmlString = Theme.getThemeButtonHTML(accent, primary, secondary, name, iconsInverted)
    }
    static getThemeButtonHTML(accent, primary, secondary, name, iconsInverted = false) {
        return `<input style="color: green" type="button" class="theme-selector" data-accent="${accent}" data-secondary="${secondary}" data-primary=${primary} data-ii="${iconsInverted}" value="${name}"/>`
    }
}





let themes = [
    new Theme("#E1F5FE", "#000000", "#ffffff", "Blue Theme"),
    new Theme("#FEFCE1", "#000000", "#ffffff", "Creame Theme"),
    new Theme("#ffffff", "#000000", "#ffffff", "White Theme"),
    new Theme("#F9E1FE", "#000000", "#ffffff", "Violet Theme"),
    new Theme("#FEE1F1", "#000000", "#ffffff", "Pink Theme"),
    new Theme("#FEE1E1", "#000000", "#ffffff", "Red Theme"),
    new Theme("#00000000", "#ffffff", "#000000", "Frost", true),
    new Theme("#000000", "#ffffff", "#000000", "Obsidian", true),
    new Theme("#000000", "#ffffff", "#313131", "Gray", true),
    new Theme("#313131", "#ffffff", "#000000", "Gray 2", true),
    new Theme("#E3FF55", "#000000", "#ffffff", "[M] Syn For Awards"),
]



for (let i = 0; i < themes.length; i++) {
    themesSection.innerHTML += themes[i].htmlString
    themesSection.children[themesSection.children.length - 1].style.background = themes[i].accent
    themesSection.children[themesSection.children.length - 1].style.color = (themes[i].iconsInverted || themes[i].name == "Greyish") ? "white" : "black"

    if (themes[i].iconsInverted) themesSection.children[themesSection.children.length - 1].style.background = "gray"
}


for (let i = 0; i < themeSelectors.length; i++) {
    themeSelectors[i].addEventListener("click", () => {
        setTheme(themeSelectors[i].dataset.accent, themeSelectors[i].dataset.primary, themeSelectors[i].dataset.secondary, themeSelectors[i].dataset.ii === "true");
    })
}

document.getElementById("theme-hue").addEventListener("input", function() {
    setTheme(rgbToHex(cssToRGBAOrRgb(`hsla(${this.value}, 100%, 93%, 1)`)), "#000000", "#ffffff")
})


function handleIconInvertion(invert) {
    root.style.setProperty("--iconInversion", `invert(${invert ? '1' : '0'})`)
}