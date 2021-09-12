const fs = require("fs");
import { timetableScraper } from './scraper';
import { dataPath } from './config';

let timetableData = {};

const year = Number(process.env.TIMETABLE_YEAR);

if (!year) {
	console.log("Envrionment variable TIMETABLE_YEAR required.")
	process.exit(1);
}

const loadData = () => {
	const dataString = fs.readFileSync(dataPath, "utf8");
	timetableData = JSON.parse(dataString).timetableData;
}

fs.watch(dataPath, loadData);

loadData();

export { timetableData };