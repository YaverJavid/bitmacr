var standalone = window.navigator.standalone,
    userAgent = window.navigator.userAgent.toLowerCase(),
    safari = /safari/.test(userAgent),
    ios = /iphone|ipod|ipad/.test(userAgent);
if (ios) {
    if (!standalone && safari) {
        // Safari
    } else if (!standalone && !safari) {
        // iOS webview
    };
} else {
    if (userAgent.includes('wv')) {
        document.querySelector("body").style.fontSize = "12pt"
        const topControlContainerChildren = document.getElementById("top-control-container").children
        for (var i = 0; i < topControlContainerChildren.length; i++) {
            topControlContainerChildren[i].style.fontSize = "1rem"
        }
    } else {
        // Chrome
         
    }
};