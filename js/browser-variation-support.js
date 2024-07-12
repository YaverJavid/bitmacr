const B_BROWSER_TYPE = "browser-type"
const B_RESIZE_HANDLER = "resize-handler"

setUpLocalStorageBucket(B_RESIZE_HANDLER, "0")
execBucket(B_RESIZE_HANDLER, "1", () => {
    id("resize-handler-suppressor").checked = true
})

id("resize-handler-suppressor").oninput = ()=>{
    setBucketVal(B_RESIZE_HANDLER, id("resize-handler-suppressor").checked ? "1" : "0")
}


function getAutoBrowserType() {
    var standalone = window.navigator.standalone,
        userAgent = window.navigator.userAgent.toLowerCase(),
        safari = /safari/.test(userAgent) && !/chrome/.test(userAgent),
        ios = /iphone|ipod|ipad/.test(userAgent),
        android = /android/.test(userAgent),
        chrome = /chrome/.test(userAgent) && !/edge/.test(userAgent),
        firefox = /firefox/.test(userAgent),
        edge = /edge/.test(userAgent);

    if (ios) {
        if (!standalone && safari) return "IOS.SAFARI";
        else if (!standalone && !safari) return "IOS.WV";
    } else if (android) {
        if (userAgent.includes('wv')) return "AOS.WV";
        else if (chrome) return "AOS.CHROME";
        else if (firefox) return "AOS.FIREFOX";
        else if (edge) return "AOS.EDGE";
        else return "AOS.OTHER";
    } else {
        if (chrome) return "DESKTOP.CHROME";
        else if (firefox) return "DESKTOP.FIREFOX";
        else if (edge) return "DESKTOP.EDGE";
        else if (safari) return "DESKTOP.SAFARI";
        else return "DESKTOP.OTHER";
    }
}

function handleBrowserType() {
    if (!getBucketVal(B_BROWSER_TYPE)) {
        let browserType = getAutoBrowserType()
        setBucketVal(B_BROWSER_TYPE, browserType)
        return browserType
    } else {
        return getBucketVal(B_BROWSER_TYPE)
    }
}

const BROWSER_TYPE = handleBrowserType()
id("browser-selector").value = BROWSER_TYPE

function applyBrowserVariation(browserType) {
    switch (browserType) {
        case 'AOS.WV':
            document.querySelector("body").style.fontSize = "12pt";
            var topControlContainerChildren = document.getElementById("top-control-container").children;
            for (var i = 0; i < topControlContainerChildren.length; i++) {
                topControlContainerChildren[i].style.fontSize = "1rem";
            }
            break;
        case "DESKTOP.CHROME":
        case "DESKTOP.EDGE":
            addResizeHandler()
        default:
            // Tab to edit
    }
}
applyBrowserVariation(BROWSER_TYPE)

id("browser-selector").oninput = () => {
    setBucketVal(B_BROWSER_TYPE, id('browser-selector').value)
}

id("reset-browser-type").onclick = () => {
    id("browser-selector").value = getAutoBrowserType()
    setBucketVal(B_BROWSER_TYPE, id("browser-selector").value)
}

function addResizeHandler() {
    if (id("resize-handler-suppressor").checked)
        window.onresize = () => {
            customConfirm("Resizing window might be causing layout bugs, if so click 'YES' to 'RELOAD'? <br> <h5>To supress this alert go to settings/preferences/suppressors</h5>", () => window.location.reload())
        }
    else window.onresize = ()=>{}
}