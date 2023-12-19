function startProcess(info = "") {
    id("process").style.display = "initial"
    id("process-info").textContent = info
}

function endProcess() {
    id("process").style.display = "none"
}