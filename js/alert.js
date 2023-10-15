const alertMessage = document.getElementById("alert-message")
const alertHeading = document.getElementById("alert-heading")
const alertBox = document.getElementById("alert")
const alertCancelButton = document.getElementById("alert-cancel-button")
let nothing = () => {}

var cancel = nothing
var ok = nothing
var then = nothing
var hasAlertAnswered = true
function customConfirm(message, ifOk = nothing, ifCancel = nothing, argThen = nothing ) {
    alertCancelButton.style.opacity = 1;
    alertBox.style.opacity = "1"
    alertBox.style.zIndex = "2"
    alertMessage.innerHTML = message
    cancel = ifCancel
    ok = ifOk
    if(!hasAlertAnswered) then("unanswered")
    hasAlertAnswered = false
    then = argThen
}

function customAlert(message){
    alertBox.style.opacity = "1"
    alertBox.style.zIndex = "2"
    alertMessage.innerHTML = "<strong>ALERT : </strong>" +  message
    alertCancelButton.style.opacity = 0;
    cancel = nothing
    ok = nothing
    if(!hasAlertAnswered) then("unanswered")
    hasAlertAnswered = false
    then = nothing
}

function hideAlert() {
    alertBox.style.opacity = "0"
    alertBox.style.zIndex = "-3"
}

function cancelAlert() {
    hasAlertAnswered = true
    hideAlert()
    cancel()
    then("cancel")
}

function okAlert() {
    hasAlertAnswered = true
    hideAlert()
    ok()
    then("ok")
}

