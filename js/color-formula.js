const VAR_OPERATORS = ["+", "", "-", "*", "/", "%"]

var resizableInputs = document.querySelectorAll('.resizable-input'); // get the input element
let colorFormulaTypeSelector = id("color-formula-type")
let colorFormulaVars = {

}

let logReport = new VisualLogReport(id("error-log"), 100)

const COLOR_FORMULA_UI_SEPARATOR = "•"
const ACTIVE_CF_INPUT_TOKEN = "active-cf-input"
const colorFormulaInputsContainer = id("color-formula-inputs-container")



function getVarElem() {
    const varElem = document.createElement("div")
    varElem.classList.add("var")
    varElem.innerHTML += `
         <img src="icons/close.svg" alt="icons/close.svg" onclick="removeColorFormulaVar(this)">
         <span></span>
         <input oninput="updateVarName(this)" type="text" class="resizable-input" data-oldname="v" value="v">
         <span>is</span>
         <input oninput="updateVarValue(this)" type="number" class="resizable-input" value="0" />
         <span>${COLOR_FORMULA_UI_SEPARATOR} &nbsp;v</span>
         <input type="button" value="+=" onclick="nextVarOperator(this)" data-opindex="0">
         <input type="text" class="resizable-input" value="1">
         <span>${COLOR_FORMULA_UI_SEPARATOR}&nbsp; max : </span>
         <input type="number" class="resizable-input"/>
         <span>${COLOR_FORMULA_UI_SEPARATOR}&nbsp; min : </span>
         <input type="number" class="resizable-input"/>
         <span>${COLOR_FORMULA_UI_SEPARATOR}&nbsp; base : </span>
         <input type="number" class="resizable-input" value="0"/>
         `

    return varElem
}

id("add-var").onclick = () => {
    id("vars").prepend(getVarElem())
    colorFormulaVars["v"] = 0
}

function updateVarName(elem) {
    delete colorFormulaVars[elem.dataset.oldname]
    elem.dataset.oldname = elem.value
    elem.parentNode.children[5].innerHTML = `${COLOR_FORMULA_UI_SEPARATOR}&nbsp; ${elem.value}`
    colorFormulaVars[elem.parentNode.children[2].value] = parseFloat(elem.parentNode.children[4].value)
}

function updateVarValue(elem) {
    colorFormulaVars[elem.parentNode.children[2].value] = parseFloat(elem.value)
}

function nextVarOperator(elem) {
    let opIndex = parseInt(elem.dataset.opindex)
    opIndex++
    opIndex %= VAR_OPERATORS.length
    elem.value = VAR_OPERATORS[opIndex] + "="
    elem.dataset.opindex = opIndex
}


function evalFormula(formula, data) {
    with(data) {
        try {
            return eval(formula)
        }
        catch (e) {
            let err = `The Formula "${formula}" resulted in error "${e}"`
            logReport.log(err)
        }
    }
}

function removeColorFormulaVar(elem) {
    customConfirm("Do you really want to delete this variable?", () => elem.parentNode.remove())
}

colorFormulaTypeSelector.oninput = () => {
    for (let i = 0; i < colorFormulaInputsContainer.children.length; i++) {
        if (colorFormulaInputsContainer.children[i].classList.contains(ACTIVE_CF_INPUT_TOKEN))
            colorFormulaInputsContainer.children[i].classList.remove(ACTIVE_CF_INPUT_TOKEN)
        if (colorFormulaInputsContainer.children[i].dataset.cfinputname == colorFormulaTypeSelector.value)
            colorFormulaInputsContainer.children[i].classList.add(ACTIVE_CF_INPUT_TOKEN)
    }
}

id("download-full-log-report").onclick = ()=>{
    downloadText("pixmacrLogReport.txt", logReport.report)
}