document.addEventListener("keydown", function (event) {
    event.key = event.key.toLowerCase()
    if (event.ctrlKey) {
        if(!['c', 'v'].includes(event.key)) event.preventDefault()
        for (let i = 0; i < menuNav.children.length; i++) {
            if (menuNav.children[i].dataset.shortcutkey == 'undefined') continue
            if (event.key == menuNav.children[i].dataset.shortcutkey) {
                redirectMenuViewTo(i * controlWidth, true)
                currentTabIndex = i
                if (!menuNav.children[i].dataset.type) {
                    menuNav.children[i].scrollIntoView()
                }
                break
            }
        }
        if (event.key == 'z') {
            if (buffer.setPointer(buffer.pointer - 1))
                applyPaintData(buffer.getItem())
        } else if (event.key == 'y') {
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
        } else if (event.key == "q") {
            alreadyFilledLinePoints = new Set()
        } else if (event.key == "u") {
            runComposer()
        }
    } else {
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        // event.preventDefault()
        switch (event.key) {
            case 'r':
                onlyFillIfColorIsCheckbox.checked = !onlyFillIfColorIsCheckbox.checked
                changeFillRuleUI()
                break
            case 'm':
                id('mirroring').checked = !id('mirroring').checked
                if (qguide.checked) refreshGuides()
                break
        }
    }
});
