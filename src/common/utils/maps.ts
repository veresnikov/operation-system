function Get<K, V>(maps: Map<K, V>, key: K): V | undefined {
    let result: V | undefined = undefined
    maps.forEach((v, k) => {
        if (JSON.stringify(k) === JSON.stringify(key) && k !== undefined && key !== undefined) {
            result = v
        }
    })
    return result
}

export {Get}