if (!localStorageREF.getItem("pixm_theme")) {
    localStorageREF.setItem("pixm_theme", "#ffffff,#000000,#ffffff")
}

// BACKWARDS COMPATIBILITY 
if((localStorageREF.getItem("pixm_theme").length - localStorageREF.getItem("pixm_theme").replaceAll(",","").length) == 2) localStorageREF.setItem("pixm_theme", localStorageREF.getItem("pixm_theme") + ",false")


let currentTheme = localStorageREF.getItem("pixm_theme").split(",")
setTheme(currentTheme[0], currentTheme[1], currentTheme[2], currentTheme[3] === "true")

function setTheme(accent, primary, secondary, iconsInverted = false) {
    setSecondaryColor(secondary)
    setAccentColor(accent)
    setPrimaryColor(primary)
    changeCellBorderColor(secondary)
    localStorageREF.setItem("pixm_theme", `${accent},${primary},${secondary},${iconsInverted}`)
    borderColor = "#" + getPrimaryColor().slice(1)
    changeCellBorderColor(borderColor)
    handleIconInvertion(iconsInverted)
}

borderColor = "#" + getPrimaryColor().slice(1)
changeCellBorderColor(borderColor)

class Theme {
    constructor(accent, primary, secondary, name, iconsInverted = false) {
        this.accent = accent,
            this.secondary = secondary,
            this.name = name,
            this.primary = primary,
            this.htmlString = Theme.getThemeButtonHTML(accent, primary, secondary, name, iconsInverted)
    }
    static getThemeButtonHTML(accent, primary, secondary, name, iconsInverted = false) {
        return `<input type="button" class="theme-selector" data-accent="${accent}" data-secondary="${secondary}" data-primary=${primary} data-ii="${iconsInverted}" value="${name}"/>`
    }
}





let themes = [
    new Theme("#E1F5FE", "#000000", "#ffffff", "Light Theme"),
    new Theme("#F9E1FE", "#000000", "#ffffff", "Violet Theme"),
    new Theme("#FEE1F1", "#000000", "#ffffff", "Pink Theme"),
    new Theme("#FEF0E1", "#000000", "#ffffff", "Buff Theme"),
    new Theme("#F5FEE1", "#000000", "#ffffff", "Green Theme"),
    new Theme("#FEE1E1", "#000000", "#ffffff", "Red Theme"),
    new Theme("#F1E1FE", "#000000", "#ffffff", "Purple Theme"),
    new Theme("#FEFCE1", "#000000", "#ffffff", "Yellow Theme"),
    new Theme("#545454", "#ffffff", "#000000", "Dark Theme.beta"),
    new Theme("#ffffff", "#000000", "#ffffff", "White Theme"),
    new Theme("#FFDE49", "#000000", "#ffffff", "Deep Slumber"),
    new Theme("#00000000", "#ffffff", "#000000", "Frost", true)
]

for (let i = 0; i < themes.length; i++) {
    themesSection.innerHTML += themes[i].htmlString
}

for (let i = 0; i < themeSelectors.length; i++) {
    themeSelectors[i].addEventListener("click", () => {
        setTheme(themeSelectors[i].dataset.accent, themeSelectors[i].dataset.primary, themeSelectors[i].dataset.secondary, themeSelectors[i].dataset.ii === "true");
    })
}

document.getElementById("theme-hue").addEventListener("input", function() {
    setTheme(rgbToHex(cssToRGBAOrRgb(`hsla(${this.value}, 100%, 93%, 1)`)),  "#000000", "#ffffff")
})


function handleIconInvertion(invert){
    document.documentElement.style.setProperty("--iconInversion", `invert(${invert ? '1' : '0'})`)
}

