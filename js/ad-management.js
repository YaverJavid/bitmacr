const adstrip = id("adstrip")
const ADSTRINGS = [
    "Buy This Space For Ads, Feel Free To Email Us On <a href='mailto:syn.pixmacr@gmail.com'>syn.pixmacr@gmail.com</a>!",
   
    ]

const setAd = msg => adstrip.innerHTML = "#Ad : " + msg

setAd(ADSTRINGS[Math.floor(Math.random() * (ADSTRINGS.length ))])

