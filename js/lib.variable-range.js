function setUpVariableRange(elem, onchangeAct = NOOP) {
    let range = elem.max;
    if (range % 2) throw new Error("setUpVariableRange Error: Given element should have an even initial max.");
    
    elem.onchange = () => {
        onchangeAct();
        const halfRange = range / 2;
        const currentValue = elem.valueAsNumber;

        if (currentValue < halfRange) {
            elem.min = 0;
            elem.max = range;
        } else {
            elem.min = currentValue - halfRange;
            elem.max = currentValue + halfRange;
        }
    };
}
