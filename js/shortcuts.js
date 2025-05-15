document.addEventListener("keydown", function (event) {
    event.key = event.key.toLowerCase();
    
    if(event.key.length > 1) return
    
    const target = event.target;

    const isTypingField =
        target.isContentEditable ||
        (target.tagName === 'INPUT' &&
            ['text', 'number', 'password', 'email', 'search', 'url', 'tel'].includes(target.type)) ||
        target.tagName === 'TEXTAREA';

    if (isTypingField) return;

    if (event.ctrlKey) {
        if (!['c', 'v'].includes(event.key)) event.preventDefault();

        for (let i = 0; i < menuNav.children.length; i++) {
            if (menuNav.children[i].dataset.shortcutkey == 'undefined') continue;
            if (event.key == menuNav.children[i].dataset.shortcutkey) {
                redirectMenuViewTo(i * controlWidth, true);
                currentTabIndex = i;
                if (!menuNav.children[i].dataset.type) {
                    menuNav.children[i].scrollIntoView();
                }
                break;
            }
        }

        switch (event.key) {
            case 'z':
                if (buffer.setPointer(buffer.pointer - 1))
                    applyPaintData(buffer.getItem());
                break;
            case 'y':
                if (buffer.setPointer(buffer.pointer + 1))
                    applyPaintData(buffer.getItem());
                break;
            case 'j':
                id("add-image-background-checkbox").checked = !id("add-image-background-checkbox").checked;
                id("add-image-background-checkbox").oninput();
                break;
            case 'p':
                id('select-color').checked = !id('select-color').checked;
                id('select-color').oninput();
                break;
            case 'd':
                endProcess();
                break;
            case 'q':
                alreadyFilledLinePoints = new Set();
                break;
            case 'u':
                runComposer();
                break;
        }
    } else {
        switch (event.key) {
            case 'r':
                onlyFillIfColorIsCheckbox.checked = !onlyFillIfColorIsCheckbox.checked;
                changeFillRuleUI();
                break;
            case 'm':
                id('mirroring').checked = !id('mirroring').checked;
                if (qguide.checked) refreshGuides();
                break;
            case 'e':
                editmode = !editmode
                if(editmode) launchEditMode();
                else exitEditMode();
                break;
            case 'f':
                addFrame();
                break;
        }
    }
});
