id("execute-custom-script").onclick = () => {
    let script = id("custom-script").value 
    customConfirm("Do you really want to run this script?", () => {
        setTimeout(()=>{startProcess("Running Your Script...")}, 100)
        try {
            eval(script + "\n endProcess();")
        } catch (e) {
            logReport.log(`Custom Script Error : "${e}"`)
        }
    })
}


id("paste-into-custom-script-textarea").onclick = async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (typeof id("custom-script").selectionStart !== 'undefined') {
            const startPos = id("custom-script").selectionStart;
            const endPos = id("custom-script").selectionEnd;
            id("custom-script").value = id("custom-script").value.substring(0, startPos) + text + id("custom-script").value.substring(endPos);
            id("custom-script").selectionStart = startPos + text.length;
            id("custom-script").selectionEnd = startPos + text.length;
        } else {
            id("custom-script").value += text;
        }
    } catch (err) {
        customAlert('Failed to read clipboard contents: '+ err);
    }
}

