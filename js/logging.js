class VisualLogReport {
  constructor(HTMLContainer, MAX_HTML_LOG_LIMIT) {
    this.report = "";
    this.HTMLContainer = HTMLContainer;
    this.MAX_HTML_LOG_LIMIT = MAX_HTML_LOG_LIMIT;
  }
  log(err) {
    this.report += `\n${err}       @reporting time : ${new Date().toLocaleString()}`;
    if (this.HTMLContainer.childElementCount > 0) {
      let prevErr = this.HTMLContainer.children[0].innerText;
      if (prevErr == err) return;
    }
    let errElem = document.createElement("p");
    errElem.innerText = err;
    this.HTMLContainer.prepend(errElem);
    if (this.HTMLContainer.childElementCount > this.MAX_HTML_LOG_LIMIT) {
      this.HTMLContainer.removeChild(this.HTMLContainer.lastChild);
    }
  }
}
