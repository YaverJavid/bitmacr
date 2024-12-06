const alertMessage = document.getElementById("alert-message")
const alertHeading = document.getElementById("alert-heading")
const alertBox = document.getElementById("alert")
const alertCancelButton = document.getElementById("alert-cancel-button")
let noop = () => {}

var cancel = noop
var ok = noop
var then = noop
var hasAlertAnswered = true
function customConfirm(message, ifOk = noop, ifCancel = noop, _then = noop ) {
    // then("replaced")
    alertCancelButton.style.opacity = 1;
    alertBox.style.opacity = "1"
    alertBox.style.zIndex = "2"
    alertMessage.innerHTML = message
    cancel = ifCancel
    ok = ifOk
    if(!hasAlertAnswered) then("unanswered")
    hasAlertAnswered = false
    then = _then
}

function customAlert(message){
    alertBox.style.opacity = "1"
    alertBox.style.zIndex = "2"
    alertMessage.innerHTML = "<strong>ALERT : </strong>" +  message
    alertCancelButton.style.opacity = 0;
    cancel = noop
    ok = noop
    if(!hasAlertAnswered) then("unanswered")
    hasAlertAnswered = false
    then = noop
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

