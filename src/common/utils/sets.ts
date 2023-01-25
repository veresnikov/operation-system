function Has<T>(set: Set<T>, value: T): boolean {
    let find = false
    set.forEach(v => {
        if (v === value) {
            find = true
        }
    })
    return find
}

export {Has}