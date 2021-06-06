import { timetableScraper } from './scraper';

let timetableData = {};
let courseWarnings = [];

const year = Number(process.env.TIMETABLE_YEAR);

if (!year) {
	console.log("Envrionment variable TIMETABLE_YEAR required.")
	process.exit(1);
}

timetableScraper(year).then((result) => {
	if (result) {
		timetableData = result.timetableData;
		courseWarnings = result.courseWarnings;
	}
});

export { timetableData, courseWarnings };