function Has<T>(set: Set<T>, value: T): boolean {
    let find = false
    set.forEach(v => {
        if (v === value) {
            find = true
        }
    })
    return find
}

function Add<T>(set: Set<T>, value: T) {
    if (!Has(set, value)) {
        set.add(value)
    }
}

export {Has, Add}