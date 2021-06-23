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
	// year is set at 2020 for now
	res.send(timetableData);
	//let FreeRoomsData = {};
	// for property in data:
		// let course_code = data["courseCode"];
		// let course_code_text = data["name"];
		// declare all variables used inside for loops here so you can merge later
		// 
		// for i in data["classes"]
			// ?? what happens if mode != in-person - must account for this
		// below is an array - could use .foreach  }
		// for i in data["classes"]["times"]
			// building_id = ?? // must split the location string somehow??
			// room_id = ??
			// room_name = ??
			// day = data["classes"]["times"]["day"]
			// start: =  data["classes"]["times"]["time"]["start"]
			// end: =  data["classes"]["times"]["time"]["end"]
			//create an object with all the information for the course for each week for this class of this course
			// let weeks = data["classes"]["times"]["weeks"]
			// for i in range(weeks) {
			// 	add building id and to freeRoomsData
			// must make if and else statements to ensure that there aren't multiple keys of the same data
			// }
			// }
			// 

	// for each

}
app.get('/api/terms/:termId/courses/:courseId', getCourse);
app.get('/api/terms/:termId/courses', getCourseList);
app.get('/api/freerooms', getFreeRoomsData);

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
