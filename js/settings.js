const shortcutInfos = document.querySelectorAll(".shortcut-info")

function changeShortcutInfoVisibility(mode) {
    for (let i = 0; i < shortcutInfos.length; i++) {
        shortcutInfos[i].style.display = mode
    }
}

setUpLocalStorageBucket("pixmacr_shortcut_info_visible", "0")

execBucket("pixmacr_shortcut_info_visible", "0", () => {
    document.getElementById("shortcut-info-checkbox").checked = false
    changeShortcutInfoVisibility("none")
})


document.getElementById("shortcut-info-checkbox").addEventListener("change", function() {
    changeShortcutInfoVisibility(this.checked ? "initial" : "none")
    setBucketOnCondition("pixmacr_shortcut_info_visible", this.checked, "1", "0")
})


// Default Pallatte Visibility 
const defaultPallettes = document.getElementsByClassName("default-pallette")

function changeDefaultPalletteVisibility(mode) {
    for (let i = 0; i < defaultPallettes.length; i++)
        defaultPallettes[i].style.display = mode
}

setUpLocalStorageBucket("pixmacr_hide_default_pallette", "0")

execBucket("pixmacr_hide_default_pallette", "1", () => {
    document.getElementById("hide-default-pallette-checkbox").checked = true
    changeDefaultPalletteVisibility("none")
})

document.getElementById("hide-default-pallette-checkbox").addEventListener("input", function() {
    changeDefaultPalletteVisibility(this.checked ? "none" : "initial")
    setBucketOnCondition("pixmacr_hide_default_pallette", this.checked, "1", "0")
})

// Animate Menu 

setUpLocalStorageBucket("pixmacr_animate_menu", "0")

execBucket("pixmacr_animate_menu", "0", () => {
    bottomControlsContainer.style.scrollBehavior = "auto"
    document.getElementById("animate-menu-checkbox").checked = false
})

document.getElementById("animate-menu-checkbox").addEventListener("input", function() {
    setBucketOnCondition("pixmacr_animate_menu", this.checked, "1", "0")
    bottomControlsContainer.style.scrollBehavior = this.checked ? "smooth" : "auto"
})


// Background



setUpLocalStorageBucket("pixmacr_background_image", "0")

execBucket("pixmacr_background_image", "1", () => {
    document.body.style.backgroundImage = "url(icons/wallpapers/default.png)"
    document.querySelector("marquee").style.color = "white"
    id("add-image-background-checkbox").checked = true
})




id("add-image-background-checkbox").oninput = function() {
    setBucketOnCondition("pixmacr_background_image", id("add-image-background-checkbox").checked, "1", "0")
    document.body.style.backgroundImage = id("add-image-background-checkbox").checked ? "url(icons/wallpapers/default.png)" : "none"
    document.querySelector("marquee").style.color = id("add-image-background-checkbox").checked ? "white" : "var(--primary)"
}
// Auto :: Save
const B_AUTO_SAVE = "pix_auto_save"
setUpLocalStorageBucket(B_AUTO_SAVE, "1")
execBucket(B_AUTO_SAVE, "0", () => {
    autoSave.checked = false
})

autoSave.addEventListener("click", () => {
    setBucketOnCondition(B_AUTO_SAVE, autoSave.checked, "1", "0")
})

// autoSave.onclick = setBucketOnCondition.bind(null, B_AUTO_SAVE, autoSave.checked, "1", "0")

// add-new-session-on-opening

const B_ADD_NEW = "pix_add_new"
setUpLocalStorageBucket(B_ADD_NEW, "0")

execBucket(B_ADD_NEW, "1", () => {
    addNewSessionOnOpening.checked = true
})

addNewSessionOnOpening.addEventListener("input", () => {
    setBucketOnCondition(B_ADD_NEW, addNewSessionOnOpening.checked, "1", "0")
})

setUpLocalStorageBucket(B_COLOR, "#115740")

// fill mode warning session
const prefFillModeWarning = id("pref-no-fill-mode-warning")

const B_FILL_MODE_WARNING = "pix_fill_mode_warning"
setUpLocalStorageBucket(B_FILL_MODE_WARNING, "1")

execBucket(B_FILL_MODE_WARNING, "0", ()=>{
    prefFillModeWarning.checked = false
})

prefFillModeWarning.oninput = ()=>{
    setBucketOnCondition(B_FILL_MODE_WARNING, prefFillModeWarning.checked, "1", "0")
}