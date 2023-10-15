const sessionsElems = document.getElementsByClassName("session")
const addSessionButton = document.getElementById("add-session")
const sessionsContainer = document.getElementById("sessions-container")
const sessionIdElems = document.getElementsByClassName("session-id")


// Local Storage

const SESSIONS_BUCKET_NAME = "pixmacr_sessions"
const SESSION_NUMBER_BUCKET_NAME = "pixmacr_no"
const SESSION_ACTIVE_CLASS = "session-active"
const B_SESSION_NO = "pixmacr_session_no"

setUpLocalStorageBucket(B_SESSION_NO, "0")

class Session {
    constructor(cols, rows, cellBorder, buffer) {
        this.cols = cols;
        this.rows = rows;
        this.cellBorder = cellBorder;
        this.buffer = buffer;
    }
    use() {
        localStorageREF.setItem(B_SESSION_NO, currentSession)

        buffer = this.buffer;
        cols = this.cols;
        rows = this.rows;
        canvasSizeShower.textContent = `(${cols})`;
        cellsSlider.value = cols;
        addCanvas(this.rows, this.cols, false);
        if (buffer.data.length > 2) {
            buffer.data.pop()
            buffer.pointer -= 1
        } else if (buffer.data.length == 2) {
            buffer.data.pop()
            buffer.pointer = 0
        }
        applyPaintData(buffer.getItem());
        updateBorderStatus(this.cellBorder)
    }
    updateCanvasSize() {
        this.cols = cols;
        this.rows = rows;
    }
    updateBorderStatus(borderSatus) {
        this.cellBorder = borderSatus;
    }
}

function getSessionElement(n, active = true) {
    let session = document.createElement("div")
    if (active)
    {
        removeActiveClassesOnSessions()
        session.classList.add(SESSION_ACTIVE_CLASS)
        localStorageREF.setItem(B_SESSION_NO, currentSession)

    }
    session.classList.add("session")
    let closeButton = document.createElement("img")
    let sessionId = document.createElement("span")
    sessionId.classList.add("session-id")
    sessionId.textContent = n
    closeButton.src = "icons/close.svg"
    closeButton.classList.add("session-delete-button")
    session.appendChild(closeButton)
    session.innerHTML += `Session`
    session.appendChild(sessionId)
    session.onclick = ev => {
        let n = parseInt(session.children[1].textContent)
        if (!(ev.target === session.children[0])) {
            if (n == currentSession) return
            removeActiveClassesOnSessions()
            currentSession = n
            session.classList.add(SESSION_ACTIVE_CLASS);
            sessions[n].buffer.deleteRight()
            sessions[n].use()
        } else {
            if (n == currentSession) {
                customAlert(`Can't Close "Session ${n}", its active!`)
                return
            }
            customConfirm(`Do you really wannt to close "Session ${n}"?`, () => {
                if (n == currentSession) {
                    customAlert(`Can't Close "Session ${n}", its active!`)
                    return
                }
                if (currentSession > n) currentSession--;
                sessions.splice(n, 1)
                sessionsContainer.removeChild(session)
                // Update Session IDS
                for (let i = 0; i < sessionIdElems.length; i++)
                    sessionIdElems[i].textContent = sessionIdElems.length - i - 1

            })
        }
    }
    return session
}

addSessionButton.onclick = () => {
    sessions.push(
        new Session(cols, rows, borderCheckbox.checked, new Stack())
    )
    sessions[sessions.length - 1].use()
    recordPaintData()
    currentSession = sessions.length - 1
    sessionsContainer.prepend(getSessionElement(sessions.length - 1))
}



function removeActiveClassesOnSessions() {
    for (let i = 0; i < sessionsElems.length; i++)
        if (sessionsElems[i].classList.contains(SESSION_ACTIVE_CLASS))
            sessionsElems[i].classList.remove(SESSION_ACTIVE_CLASS);
}


function bufferObjectToBufferStack(bufferObject) {
    let buffer = new Stack;
    buffer.data = bufferObject.data;
    buffer.pointer = 0;
    return buffer
}

function sessionsJSONToJS(json) {
    let sessions = JSON.parse(json)
    for (let i = 0; i < sessions.length; i++) {
        sessions[i] = new Session(sessions[i].cols, sessions[i].rows, sessions[i].cellBorder, bufferObjectToBufferStack(sessions[i].buffer))
    }
    return sessions
}

function saveSessions(sessions, feedback = false) {
    try {
        for (let i = 0; i < sessions.length; i++)
            sessions[i].buffer.deleteAllExcept()
        localStorageREF.setItem(SESSIONS_BUCKET_NAME, JSON.stringify(sessions))
    } catch (e) {
        customAlert("Can't Save : Memory Exeeded 🙀, Try Clearing Some Sessions!")
        return
    }
    if (feedback) playSaveSound()

}


setUpLocalStorageBucket(SESSIONS_BUCKET_NAME, JSON.stringify([new Session(cols, rows, borderCheckbox.checked, buffer)]))

let sessions = sessionsJSONToJS(getBucketVal(SESSIONS_BUCKET_NAME))
let currentSession = parseInt(getBucketVal(B_SESSION_NO))
currentSession = currentSession < sessions.length ? currentSession : 0
if (addNewSessionOnOpening.checked) {
    sessions.push(
        new Session(cols, rows, borderCheckbox.checked, new Stack())
    )
    currentSession = sessions.length - 1
}



for (let i = 0; i < sessions.length; i++) {
    sessionsContainer.prepend(getSessionElement(i, false))
}

sessionsContainer.children[sessions.length - currentSession - 1].scrollIntoView()

sessionsElems[sessionsElems.length - currentSession - 1].classList.add(SESSION_ACTIVE_CLASS)
sessions[currentSession].use()


window.addEventListener("unload", () => {
    if (autoSave.checked)
        saveSessions(sessions)
})


function closeAllSessions() {
    customConfirm(`All Sessions Except "Session ${currentSession}" Will Be Deleted. Do You Really Want To Proceed?`,
        () => {
            sessions = [sessions[currentSession]]
            sessionsContainer.innerHTML = ""
            currentSession = 0
            sessionsContainer.appendChild(getSessionElement(0))
        }
    )
}


