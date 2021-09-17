const fs = require("fs");
import { dataPath, year } from './config';

let timetableData = {};

const loadData = () => {
	const dataString = fs.readFileSync(dataPath, "utf8");
	timetableData = JSON.parse(dataString).timetableData;
}

fs.watch(dataPath, loadData);

loadData();

export { timetableData };
