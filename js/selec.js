const selectors = document.getElementsByClassName("selector")

for (let i = 0; i < selectors.length; i++) {
    let optionFullHeight = selectors[i].children[0].getBoundingClientRect().height
    selectors[i].style.height = optionFullHeight + "px"
    let j = 0
    selectors[i].value = selectors[i].children[0].dataset.value
    selectors[i].onclick = (ev) => {
        let optionFullHeight = selectors[i].children[0].getBoundingClientRect().height
        selectors[i].style.height = optionFullHeight + "px"
        var rect = selectors[i].getBoundingClientRect();
        if (selectors[i].dataset.oneway == "true") {
            j++
        }
        else {
            if (ev.clientX - rect.left <= selectors[i].clientWidth / 2) {
                j--;
                if (j < 0) j = selectors[i].children.length - 1
            }
            else j++;
        }
        selectors[i].value = selectors[i].children[j % selectors[i].children.length].dataset.value
        selectors[i].scrollTop = (j % selectors[i].children.length) * optionFullHeight
    }
}