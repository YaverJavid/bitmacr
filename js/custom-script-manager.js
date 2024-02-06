id("execute-custom-script").onclick = ()=>{
    let script = id("custom-script").value
    customConfirm("Do you really want to run this script?", ()=>{
        try {
            eval(script)
        } catch (e) {
            logReport.log(`Custom Script Error : "${e}"`)
        }
    })
}