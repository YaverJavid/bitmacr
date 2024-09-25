if (!localStorage) {
    // IF THERE IS NO LOCAL STORAGE PRESENT, EMULATE IT
    var localStorageREF = {}
    localStorageREF.setItem = (id, val) => {
        localStorageREF[id] = val
    }
    localStorageREF.getItem = (id) => {
        return localStorageREF[id]
    }
} else {
    var localStorageREF = localStorage
}

function setUpLocalStorageBucket(bucketName, value, setup = () => { }, ...setupArgs) {
    if (localStorageREF.getItem(bucketName) != undefined) return
    localStorageREF.setItem(bucketName, value)
    return setup(...setupArgs)
}

function execBucket(bucketName, expectedValue, action, ...actionArgs) {
    if (localStorageREF.getItem(bucketName) == expectedValue) action(...actionArgs)
    return localStorageREF.getItem(bucketName) == expectedValue
}

function setBucketOnCondition(bucketName, condition, valueIfTrue, valueIfFalse) {
    let bucketValue = condition ? valueIfTrue : valueIfFalse
    localStorageREF.setItem(bucketName, bucketValue)
    return bucketValue
}

function getBucketVal(bucketName) {
    return localStorageREF.getItem(bucketName)
}


function setBucketVal(bucketName, value) {
    localStorageREF.setItem(bucketName, value)
}
