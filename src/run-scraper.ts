const fs = require("fs").promises;
import { timetableScraper } from "./scraper";
import { dataPath, year } from './config';

(async () => {
	const data = await timetableScraper(year);
	const output = JSON.stringify(data);

	await fs.writeFile(dataPath, output);
})();
