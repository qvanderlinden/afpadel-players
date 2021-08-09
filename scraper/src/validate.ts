import fs from 'fs';

import parse from 'csv-parse/lib/sync';

export const validate = (filePath: string): boolean => {
  const data = fs.readFileSync(filePath);
  const parsed = parse(data);

	const players = parsed.slice(1)
	const hashes = new Set()
	for (const player of players) {
		const hash = player.join(',')
		if (hashes.has(hash)) {
			console.error(`Duplicated player with hash "${hash}"`)
			return false
		}

		hashes.add(hash)
	}

  return true;
};
