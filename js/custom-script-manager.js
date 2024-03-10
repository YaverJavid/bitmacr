id("execute-custom-script").onclick = ()=>{
    let script = id("custom-script").value
    customConfirm("Do you really want to run this script?", ()=>{
        startProcess("Running Your Script...")
        try {
            eval(script)
        } catch (e) {
            logReport.log(`Custom Script Error : "${e}"`)
        }
        endProcess()
    })
}