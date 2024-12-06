const dialogs = document.querySelectorAll('dialog');

for (let i = 0; i < dialogs.length; i++) {
    let dialog = dialogs[i];
    dialog.children[0].children[1].onclick = () => {
        dialog.close()
    }
    dialog.addEventListener("click", ({ target: dialog }) => {
        if (dialog.nodeName === "DIALOG") {
            dialog.close("dismiss");
        }
    });
}