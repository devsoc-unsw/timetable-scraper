const fs = require("fs");
import { dataPath, year } from './config';

interface Data {
	timetableData: object;
	courseWarnings: any[];
	lastUpdated: number;
}

let data: Data = {
	timetableData: {},
	courseWarnings: [],
	lastUpdated: 0
};

const loadData = () => {
	data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

fs.watch(dataPath, loadData);

loadData();

export { data };
