let snippetData = {
    Misc : {
        'Undo' : 'undo()',
        'Record Paint Data' : 'recordPaintData()',
        'Click On Cell':'fc(pack(x, y))'
    },
    Filters: {
        'Invert': 'id("filter-invert").onclick()',
        'Sepia': 'id("filter-sepia").onclick()',
        'Grayscale': 'id("filter-grayscale").onclick()',
        'Solarize': 'id("filter-solorize").onclick()',
        'Add Noise': 'id("shift-colors-button").onclick()',
        'Duotone': 'id("filter-duotone").onclick()',
        'Simplify Colours': 'simplifyColorsEvent()',
        'Custom Filter': 'id("apply-custom-filter").onclick()'
    },
    Blurs: {
        'Box Blur': 'id("filter-box-blur").onclick()',
        'Gaussian Blur': 'id("filter-gaussian-blur").onclick()',
        'Motion Blur': 'id("filter-motion-blur").onclick()'
    },
    Animation: {
        'Add Frame': 'addFrame()'
    },
    Logic: {
        'loop': `
        loop(limit, (i)=>{
            //Put your code here
        })
        `
    },
    Shapes : {
        'Line' : 'drawWrapper(drawLine, x1, y1, x2, y2)',
        'Draw Wrapper' : 'drawWrapper()'
    },
    Variables : {
        'Coloums' : 'cols',
        'Rows' : 'rows'
    }

}


id("execute-custom-script").onclick = () => {
    let script = id("custom-script").value
    customConfirm("Do you really want to run this script? Make sure you know what you are doing!", () => {
        startProcess("Running Your Script...")
        setTimeout(() => {
            try {
                eval(script + "\n endProcess();")
            } catch (e) {
                endProcess()
                logReport.log(`Custom Script Error : "${e}"`)
            }
        }, 100)
    })
}


function insertTextAtCursor(element, text) {
    if (typeof element.selectionStart !== 'undefined') {
        const startPos = element.selectionStart;
        const endPos = element.selectionEnd;
        element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos);
        element.selectionStart = startPos + text.length;
        element.selectionEnd = startPos + text.length;
    } else {
        element.value += text;
    }
}

id("paste-into-custom-script-textarea").onclick = async () => {
    try {
        const text = await navigator.clipboard.readText();
        insertTextAtCursor(id("custom-script"), text);
    } catch (err) {
        customAlert('Failed to read clipboard contents: ' + err);
    }
}


let snippetCatagories = Object.keys(snippetData)
for (let i = 0; i < snippetCatagories.length; i++) {
    id('code-snippet-catagory').innerHTML += `<option value="${snippetCatagories[i]}">${snippetCatagories[i]}</option>`
}

function addCodeSnippetOptions(type) {
    id('code-snippet').innerHTML = ''
    let codeSnippets = Object.keys(snippetData[type])
    for (let i = 0; i < codeSnippets.length; i++) {
        id('code-snippet').innerHTML += `<option value="${codeSnippets[i]}">${codeSnippets[i]}</option>`
    }
}

addCodeSnippetOptions(snippetCatagories[0])

id('code-snippet-catagory').oninput = () => {
    addCodeSnippetOptions(id('code-snippet-catagory').value)
}

id('insert-code-snippet').onclick = () => {
    let code = snippetData[id('code-snippet-catagory').value][id('code-snippet').value] + '\n'
    insertTextAtCursor(id("custom-script"), code)
}