function startProcess(htmlContent = "") {
    id("process").style.display = "initial"
    id("process-info").innerHTML = htmlContent
}

function endProcess() {
    id("process").style.display = "none"
}

