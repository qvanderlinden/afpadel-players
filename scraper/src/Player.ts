import fromPairs from 'lodash/fromPairs'
import zip from 'lodash/zip'

class Player {
    constructor(columns: string[], values: string[]) {
        const pairs = zip(columns, values)
        return fromPairs(pairs)
    }
}

export default Player