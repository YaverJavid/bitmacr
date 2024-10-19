const actionType = id('action-type')
const actionsContainer = id('actions-container');
function addAction() {
    const actionDiv = document.createElement('div');
    actionDiv.dataset.code = actionType.value
    actionDiv.classList.add('action');
    const img = document.createElement('img');
    img.src = 'icons/close.svg';
    img.alt = 'Delete Action';
    img.onclick = function () {
        actionsContainer.removeChild(this.parentElement)
    }
    const span = document.createElement('span');
    span.textContent = actionType.options[actionType.selectedIndex].text
    actionDiv.appendChild(img);
    actionDiv.appendChild(span);
    actionsContainer.appendChild(actionDiv);
}

function runComposer(){
    for (let i = 0; i < actionsContainer.children.length; i++) {
        eval(actionsContainer.children[i].dataset.code)
    }
}