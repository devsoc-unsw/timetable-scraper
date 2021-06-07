import * as express from 'express';
import { timetableData } from './automatic-scraper';

const app = express();
const port = process.env.PORT || 3001;

// Express routes

// The following routes should match what our current server sends. For example:
// - https://notangles-server.csesoc.unsw.edu.au/api/terms/2021-T2/courses/
// - https://notangles-server.csesoc.unsw.edu.au/api/terms/2021-T2/courses/COMP1511

// Note: we no longer need the "_id" key, so that can be omitted.

// The data in the variable `timetableData` is mostly in the right format
// already, so you shouldn't need to do much processing on it.

// Sends json data for the given course in the given year and term:
// (for the data format, see "Example Extracted Data" in README.md)
const getCourse = (req: express.Request, res: express.Response) => {
	// Access the timetable data object with:
	// - timetableData

	// Access the url parameters with:
	// - params.termId (e.g. 2021-T2)
	// - params.courseId (e.g. COMP1511)

	res.send("todo");
};

// Sends json data for a summary of courses in the given term:
// ["courseCode":"COMP1511","name":"Programming Fundamentals"},...]
const getCourseList = (req: express.Request, res: express.Response) => {
	// Access the timetable data object with:
	// - timetableData

	// Access the url parameters with:
	// - params.termId (e.g. 2021-T2)

	res.send("todo");
};

// returns 
// {
// 	"Term": {
// 	  "BuildingID": {
// 		"RoomID": {
// 		  "name": "RoomName",
// 		  "Week": {
// 			"Day": [
// 			  {
// 				"courseCode": "courseCodeText",
// 				"start": "Time_Text",
// 				"end": "Time_Text"
// 			  }
// 			]
// 		  }
// 		}
// 	  }
// 	}
//   }
const getFreeRoomsData = (req: express.Request, res: express.Response) => {

}
app.get('/api/terms/:termId/courses/:courseId', getCourse);
app.get('/api/terms/:termId/courses', getCourseList);

app.use((_, res, next) => {
	// update to match the domain you will make the request from
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}.`);
  console.log('Press ctrl-c to stop.');
});
