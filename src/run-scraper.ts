const fs = require("fs").promises;
import { timetableScraper } from "./scraper";
import { dataPath } from './config';

(async () => {
	const year = Number(process.env.TIMETABLE_YEAR);

	if (!year) {
		console.log("Environment variable TIMETABLE_YEAR required.");
		process.exit(1);
	}

	const data = await timetableScraper(year);
	const output = JSON.stringify(data);

	await fs.writeFile(dataPath, output);
})();