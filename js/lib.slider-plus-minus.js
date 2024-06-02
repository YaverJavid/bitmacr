function setupSliderWithButtons(minusButton, plusButton, slider, minusCount = 0, plusCount = minusCount, minusAct = () => {}, plusAct = () => {}) {
    minusButton.value = "-" + minusCount
    plusButton.value = "+" + plusCount
    minusButton.onclick = () => {
        slider.value = parseFloat(slider.value) - minusCount
        minusAct()
    }
    plusButton.onclick = () => {
        slider.value = parseFloat(slider.value) + plusCount
        plusAct()
    }
}

function setupNumInputWithButtons(minusButton, plusButton, input, minusCount = 1, plusCount = minusCount, isNegativeAllowed, minusAct = () => {}, plusAct = () => {}) {
    minusButton.value = "-" + minusCount
    plusButton.value = "+" + plusCount
    minusButton.onclick = () => {

        if (input.value == "") input.value = "0"
        if (!(isNegativeAllowed == false && (parseFloat(input.value) - minusCount) < 0))
            input.value = parseFloat(input.value) - minusCount
        minusAct()
    }
    plusButton.onclick = () => {
        if (input.value == "") input.value = "0"

        input.value = parseFloat(input.value) + plusCount
        plusAct()
    }
}

setupSliderWithButtons(id("export-res-minus"), id("export-res-plus"), id("export-res"), 1, 1,
    plusAct = () => id("export-res-shower").innerHTML = `(${id("export-res").value})`,
    minusAct = () => id("export-res-shower").innerHTML = `(${id("export-res").value})`
)