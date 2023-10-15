if (!localStorageREF.getItem("pixm_theme")) {
    localStorageREF.setItem("pixm_theme", "#ffffff,#000000,#ffffff")
}

let currentTheme = localStorageREF.getItem("pixm_theme").split(",")
setTheme(currentTheme[0], currentTheme[1], currentTheme[2])

function setTheme(accent, primary, secondary) {
    setSecondaryColor(secondary)
    setAccentColor(accent)
    setPrimaryColor(primary)
    changeCellBorderColor(secondary)
    localStorageREF.setItem("pixm_theme", `${accent},${primary},${secondary}`)
    borderColor = "#" + getPrimaryColor().slice(1)
    changeCellBorderColor(borderColor)

}

borderColor = "#" + getPrimaryColor().slice(1)
changeCellBorderColor(borderColor)

class Theme {
    constructor(accent, primary, secondary, name) {
        this.accent = accent,
            this.secondary = secondary,
            this.name = name,
            this.primary = primary,
            this.htmlString = Theme.getThemeButtonHTML(accent, primary, secondary, name)
    }
    static getThemeButtonHTML(accent, primary, secondary, name) {
        return `<input type="button" class="theme-selector" data-accent="${accent}" data-secondary="${secondary}" data-primary=${primary} value="${name}"/>`
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
    new Theme("#FFDE49", "#000000", "#ffffff", "Deep Slumber")
]

for (let i = 0; i < themes.length; i++) {
    themesSection.innerHTML += themes[i].htmlString
}

for (let i = 0; i < themeSelectors.length; i++) {
    themeSelectors[i].addEventListener("click", () => {
        setTheme(themeSelectors[i].dataset.accent, themeSelectors[i].dataset.primary, themeSelectors[i].dataset.secondary);
    })
}

document.getElementById("theme-hue").addEventListener("input", function() {
    setTheme(rgbToHex(cssToRGBAOrRgb(`hsla(${this.value}, 100%, 93%, 1)`)),  "#000000", "#ffffff")
})