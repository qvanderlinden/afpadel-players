import stringify from 'csv-stringify/lib/sync'
import fs from 'fs'

import Player from './Player'

const saveToFile = (records: Array<Player>, outputFile: string) => {
    const data = stringify(records, { header: true })
    fs.writeFileSync(outputFile, data)
}

export default saveToFile