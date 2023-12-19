function first(first, ...others) {
    return first
}

function firstl(first, ...others) {
    for (let i = 0; i < others.length; i++)  console.log(others[i])
    return first
}

const fp = console.log

const avgc = (r,g,b) => (r+g+b)/3

// TODO
// function getCol(pid){
//   return pid % rows
// }

// function getRow(pid){
//     return pid/cols
// }


