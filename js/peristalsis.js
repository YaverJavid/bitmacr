let cycleDuration = 1;

setInterval(() => {
    localStorageREF.setItem(B_SAVED_PALETTES, JSON.stringify(savedPalettes))
    if (autoSave.checked) {
        // if (zoomedIn) zoomOut()
        saveSessions(sessions)
    }    
}, cycleDuration * 1000)
