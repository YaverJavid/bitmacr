let platform = "web"

if (platform == "android") {
    let cordova = document.createElement('script');
    cordova.setAttribute('src', 'cordova.js');
    document.head.appendChild(cordova);
}

