function setUpVariableRange(elem, onchangeAct = NOOP) {
    let range = elem.max
    if(range % 2) throw new Error("setUpVariableRange Error : Given element should have a even initial max.")
    elem.onchange = () => {
        onchangeAct()
            elem.min = elem.value < range / 2 ? range : elem.valueAsNumber - range / 2
            elem.max = elem.value < range / 2 ? 0 : elem.valueAsNumber + range / 2
    }
}