let B_SIGNED = 'pixmacr-signed'
setUpLocalStorageBucket(B_SIGNED, '0')

execBucket(B_SIGNED, '0', ()=> contractual.showModal())

function sign(){
    if(id('pp').checked && id('tac').checked){
        setBucketVal(B_SIGNED, '1')
        contractual.close()
    }
}