const id = id => document.getElementById(id)
let data = [
    ['Toggling The Fill Rule', 'R', 'Fill <em>R</em>ule.'],
    ['Toggling The Mirroring', 'M', 'M for Mirroring'],
    ['GENERAL', '*S', 'S is for <em>s</em>tarting.'],
    ['BASIC TOOLS', '*B', '<em>B</em>asic tools.'],
    ['SHAPE TOOLS', '*1', 'Shape tools are the first important tools.'],
    ['FILTERS', '*F', '<em>F</em>ilters.'],
    ['REPLACE TOOLS', '*R', 'R for Replace.'],
    ['EXPORT OPTIONS', '*E', 'Export starts with "E".'],
    ['ANIMATION', '*A', 'Animation starts with "A".'],
    ['THEMES', '*H', 'T<em>h</em>emes'],
    ['EXTRA CLICK MODES', '*X', 'X for E<em>x</em>tra.'],
    ['CANVAS MANIPULATION', '*M', 'Manipulation starts with "M".'],
    ['SETTINGS', '*,', 'It is an universal shortcut.'],
    ['Undo', '*Z', 'It is an universal shortcut.'],
    ['Redo', '*Y', 'It is an universal shortcut.'],
    ['Toggling The Background', '*J', 'J for JPEG.'],
    ['Toggling The Color Picker', '*P', 'P is for <em>P</em>icker.'],
    ['Force Close The Loader', '*D', 'D for "Destroy" the Loader.'],
];

let keys = document.querySelectorAll('.key')
const answer = id('answer')

for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    key.onclick = () => {
        currentAnswer.push(key.textContent)
        renderAnswer()
    }
}

let currentAnswer = []

function renderAnswer() {
    let HTML = ''
    currentAnswer.forEach((e, i) => {
        HTML += getAnswerKeyHTML(e, i) + '+'
    })
    answer.innerHTML = HTML.slice(0, HTML.length - 1)
}

function getAnswerKeyHTML(key, i) {
    return `<div class="answer-key">
      <span class="answer-key">${key}</span>
      <span class="answer-closer"  onclick='removeAnswer(${i})'>x</span>
    </div>`
}

function removeAnswer(i) {
    currentAnswer.splice(i, 1)
    renderAnswer()
}

function ask() {
    id('top-score').textContent = `${score}/${maxScore - unvisitedQuestions.length}`
    if (unvisitedQuestions.length == 0) {
        finish()
        return
    }
    let questionIndex = unvisitedQuestions[Math.floor(Math.random() * (unvisitedQuestions.length - 1))]
    currentQuestion = data[questionIndex]
    unvisitedQuestions.splice(unvisitedQuestions.indexOf(questionIndex), 1);
    id('question-specifier').textContent = currentQuestion[0]
    id('top-questions-left').textContent = unvisitedQuestions.length
}

function wrongAnswer() {
    id('tip-screen').showModal()
    id('tip-content').innerHTML = "TIP : " + currentQuestion[2]
    let correctAnswer = currentQuestion[1][0] == '*' ? `Ctrl + ${currentQuestion[1][1]}` : currentQuestion[1]
    id('correct-answer').textContent = correctAnswer
}

function finish() {
    id('score').textContent = `${score}/${maxScore}`
    id('finish-screen').showModal()
}

function setup() {
    score = 0
    currentQuestion = undefined
    unvisitedQuestions = Array.from({ length: data.length }, (_, i) => i);
    ask()
    id('top-questions-left').textContent = unvisitedQuestions.length
}

let maxScore = data.length
let score, currentQuestion, unvisitedQuestions
setup()

id("answer-button").onclick = () => {
    if(currentAnswer.length == 0) return
    let isLengthOK = currentAnswer.length <= 2
    let isCtrlFine = currentQuestion[1].includes('*') ? currentAnswer.includes('Ctrl') : true
    const key = currentAnswer.filter(v => v != 'Ctrl')[0]
    let isKeyMatching = currentQuestion[1].includes(key)
    currentAnswer = []
    renderAnswer()
    if (isLengthOK && isCtrlFine && isKeyMatching) {
        score++
        ask()
    } else {
        wrongAnswer()
    }
    id('top-questions-left').textContent = unvisitedQuestions.length
}

id('next-question').onclick = () => {
    id('tip-screen').close()
    ask()
}

id('finish').onclick = () => {
    id('finish-screen').close()
    setup()
}