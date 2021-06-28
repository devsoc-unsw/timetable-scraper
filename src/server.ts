import * as express from 'express';
import { timetableData } from './automatic-scraper';

const app = express();
const port = process.env.PORT || 3001;
// Running: npx nodemon --exec TIMETABLE_YEAR=2020 npm start

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

const getAllData = (req: express.Request, res: express.Response) => {
	res.send(timetableData);
}

const getFreeroomsData = (req: express.Request, res: express.Response) => {

setTimeout(function() {
	let freeroomsData = {};
	let data = timetableData["Summer"];

	// // focus on T1
	console.log(data);

	// summer is an object -> should be a list


	for (let course of data) {
		if (course["mode"] != "In Person") {
			continue;
		}
		let courseCode = course["courseCode"];
		let courseName = course["name"];
		for (let timeElement of course["classes"]["times"]) {
			// "Central Lecture Block 7 (K-E19-104)
			// location ->"Central Lecture Block 7" "K-E19-1)"	
	 		// building ID = K-E19, room ID = 104
	 		// locationId -> buildingID + roomID i.e K-E19-1
			let [roomName, locationId] = timeElement["location"].split(" (");
			let [campus, buildingId, roomId] = locationId.split("-");
			buildingId = campus + "-" + buildingId;
			roomId = roomId.slice(0, -1);

			freeroomsData = {
				"buildingId" : buildingId,
				"roomId" : roomId,
				"roomName" : roomName,
			}

			break;
		}
	break;
	}
	// 		let day = timeElement["day"];
	// 		let start = timeElement["time"["start"]];
	// 		let end = timeElement["time"["end"]];
	// 		let weeks = timeElement["weeks"];
	// 		// case 1: "weeks": 11
	// 		// case 2: "weeks":"1-11",
	// 		// case 3: "weeks" : 3, 5, 7
	// 		// case 4: "weeks": "1-2, 3-5, 7-10"

	// 		if (!weeks.includes(",") && !weeks.includes("-")) {
	// 			// case 1: "weeks": one number e.g. 11
	// 		} else if (!weeks.includes(",")) {
	// 			// case 2: "weeks": one range e.g. 1-11
	// 			let [startRange, endRange] = weeks.split["-"];
	// 			// turn string into a decimal number after splitting
	// 			startRange = parseInt(startRange, 10);
	// 			endRange = parseInt(endRange, 10);

	// 			for (let currentWeek = startRange; currentWeek < endRange; currentWeek++) {
	// 				if (freeroomsData[buildingId] === undefined) {
	// 					freeroomsData[buildingId] = {
	// 						roomId: {
	// 							"name": roomName,
	// 							currentWeek : {
	// 								day : [ {
	// 									courseCode : courseName,
	// 									"start" : start,
	// 									"end" : end,
	// 									}
	// 								],
	// 							}
	// 						}
	// 					}
	// 				} else if (freeroomsData[buildingId][roomId] === undefined) {
	// 					freeroomsData[buildingId] = {
	// 						roomId: {
	// 							"name": roomName,
	// 							currentWeek : {
	// 								day : [ {
	// 									courseCode : courseName,
	// 									"start" : start,
	// 									"end" : end,
	// 									}
	// 								],
	// 							}
	// 						}
	// 					}
	// 				// if roomId exists, then roomName should also exist - given to us as e.g. (K-E19-104)
	// 				// } else if (freeroomsData[buildingId][roomId][roomName] === undefined) {
	// 				// 	freeroomsData[buildingId][roomId] = {
	// 				// 		"name": roomName,
	// 				// 		currentWeek : {
	// 				// 			day : [ {
	// 				// 				courseCode : courseName,
	// 				// 				"start" : start,
	// 				// 				"end" : end,
	// 				// 				}
	// 				// 			],
	// 				// 		}
	// 				// 	}
	// 				} else if (freeroomsData[buildingId][roomId][currentWeek] === undefined) {
	// 					freeroomsData[buildingId][roomId][currentWeek] = {
	// 						day : [ {
	// 							courseCode : courseName,
	// 							"start" : start,
	// 							"end" : end,
	// 						}
	// 						],
	// 					}							
	// 				} else if (freeroomsData[buildingId][roomId][currentWeek][day] === undefined) {
	// 					freeroomsData[buildingId][roomId][currentWeek][day] = [
	// 						{
	// 							courseCode : courseName,
	// 							"start" : start,
	// 							"end" : end,
	// 						},
	// 					]
	// 				} else {
	// 					freeroomsData[buildingId][roomId][currentWeek][day].push({
	// 						courseCode : courseName,
	// 						"start" : start,
	// 						"end" : end,
	// 					})							
	// 				}
						
	// 			}	
					

	// 		} else if (!weeks.includes("-")) {
	// 			// case 3: "weeks": list of numbers e.g. 3,5,7...
				
	// 		} else {
	// 			// case 4: "weeks": list of ranges e.g. 1-2, 3-4 etc.
	// 		}

	// 		// Putting it into freeroomsData
	
	// // 		break;
	// // 	}
	// //  	break;
	// // }
	// // // for i in data["classes"]["times"]
	// 		///...
	// // 	// day = data["classes"]["times"]["day"]
	// // 	// start: =  data["classes"]["times"]["time"]["start"]
	// // 	// end: =  data["classes"]["times"]["time"]["end"]
	// // 	//create an object with all the information for the course for each week for this class of this course
	// // 	// let weeks = data["classes"]["times"]["weeks"]
	// // 	// for i in range(weeks) {
	// // 	// 	add building id and to freeRoomsData
	// // 	// must make if and else statements to ensure that there aren't multiple keys of the same data

	// //res.send(freeroomsData);
	res.send(freeroomsData);
	
}, 60000);
}

app.get('/api/terms/:termId/courses/:courseId', getCourse);
app.get('/api/terms/:termId/courses', getCourseList);
app.get('/api/freerooms', getFreeroomsData);
app.get('/api/', getAllData);

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
