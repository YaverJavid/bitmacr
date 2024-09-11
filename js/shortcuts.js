

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey) {
        event.preventDefault()
        for (let i = 0; i < menuNav.children.length; i++) {
            if (menuNav.children[i].dataset.shortcutkey == 'undefined') continue
            if (event.key == menuNav.children[i].dataset.shortcutkey) {
                redirectMenuViewTo(menuSegmentLocations[i])
                if (!menuNav.children[i].dataset.type) {
                    menuNav.children[i].scrollIntoView()
                }
                break
            }
        }
        if (event.key == 'u') {
            if (buffer.setPointer(buffer.pointer - 1))
                applyPaintData(buffer.getItem())
        } else if (event.key == 'i') {
            if (buffer.setPointer(buffer.pointer + 1))
                applyPaintData(buffer.getItem())
        } else if (event.key == "j") {
            id("add-image-background-checkbox").checked = !id("add-image-background-checkbox").checked
            id("add-image-background-checkbox").oninput()
        } else if (event.key == "p") {
            id('select-color').checked = !id('select-color').checked
            id('select-color').oninput()
        } else if (event.key == "d") {
           endProcess()
        }
    }
});



// tcoqxfghz