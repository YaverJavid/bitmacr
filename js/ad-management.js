const adstrip = id("adstrip")
const ADSTRINGS = [
    "Buy This Space For Ads, Feel Free To Email Us On <a href='mailto:syn.pixmacr@gmail.com'>syn.pixmacr@gmail.com</a>!",
    "Watch Yaver Javid On YouTube : <a href='https://youtube.com/@yaverjavid'>Yaver Javid</a>!",
    "CIEL - Cambridge Institute Of Educational Learning Pampore is the top institution of Kashmir. Feel free to register at : <a href='tel:9596142561'>+91-9596-142-561</a>."
    ]

const setAd = msg => adstrip.innerHTML = "#Ad : " + msg

setAd(ADSTRINGS[Math.floor(Math.random() * (ADSTRINGS.length ))])


