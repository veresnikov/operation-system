function Get<K, V>(maps: Map<K, V>, key: K): V | undefined {
    let result: V | undefined = undefined
    maps.forEach((v, k) => {
        if (JSON.stringify(k) === JSON.stringify(key) && k !== undefined && key !== undefined) {
            result = v
        }
    })
    return result
}

function Delete<K, V>(maps: Map<K, V>, key: K): boolean {
    let keyInMap: K | null = null
    maps.forEach((v, k) => {
        if (JSON.stringify(k) === JSON.stringify(key) && k !== undefined && key !== undefined) {
            keyInMap = k
        }
    })
    if (keyInMap !== null) {
        return maps.delete(keyInMap)
    }
    return false
}

export {Get, Delete}