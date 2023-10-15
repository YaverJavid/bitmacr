class Stack {
    constructor(limit = 64) {
        this.data = []
        this.limit = limit
        this.pointer = -1
    }

    addItem(item, preservePointer = false) {
        this.data.push(item)
        if (this.data.length > this.limit) {
            this.data.shift()
        }
        if (!preservePointer) {
            this.pointer = this.data.length - 1
        }
    }
    clearStack() {
        this.data = []
        this.pointer = -1
    }
    getItem(index = this.pointer) {
        if (index >= this.data.length || index < 0) {
            throw new Error("Stack Class Error : Cant Get, Stack Out Of Range")
        }
        return this.data[index]
    }
    getAllItems() {
        return this.data
    }
    setPointer(pointer, ignoreIfOutOfRange = true) {
        if (pointer >= this.data.length || pointer < 0) {
            if (ignoreIfOutOfRange) return false
            throw new Error("Stack Class Error : Cant Set Pointer, Stack Out Of Range")
        }
        this.pointer = pointer
        return true
    }
    deleteRight() {
        this.data = this.data.slice(0, this.pointer + 1)
    }
    deleteAllExcept(index = this.pointer) {
        if (index < 0 || index >= this.data.length) {
            return; // Invalid index, do nothing
        }
        this.data.splice(0, index);
        this.data.splice(1);
    }

}