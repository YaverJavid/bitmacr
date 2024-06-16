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
 function y(pid){
   return pid % rows
 }

function x(pid){
     return pid/cols
}


function $(id) {
    return colorFormulaVars[id]
}