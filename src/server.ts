import * as express from "express";
import { timetableData } from "./automatic-scraper";

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
  // - req.params.termId (e.g. 2021-T2)
  // - req.params.courseId (e.g. COMP1511)
  
  console.log(timetableData);

  const term = req.params.termId.substring(5);
  const course = req.params.courseId;
  
  const termCourses = timetableData[term]; 
  //console.log(term);
  for (let i = 0; i < termCourses.length; i++) {
    
    if (course == termCourses[i].courseCode) {
      res.json(termCourses[i]);
      return;
    }
    
  }
  res.status(400).send("Invalid termId/courseId param");
};

// Sends json data for a summary of courses in the given term:
// [{"courseCode":"COMP1511","name":"Programming Fundamentals"},...]
const getCourseList = (req: express.Request, res: express.Response) => {
  // Access the timetable data object with:
  // - timetableData
  
  // Access the url parameters with:
  // - req.params.termId (e.g. 2021-T2)

  const term = req.params.termId.substring(5);
  const termCourses = timetableData[term];
  const resCourses = [];
  // resCourses.push(...)

  console.log(termCourses);

  for (let i = 0; i < termCourses.length; i++) {
    const courseSummary = {
      courseCode: ...,
      name: ...
    };

    resCourses.push(termCourses[i]);
  }


  //res.send("todo");
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

const getFreeroomsData = (req: express.Request, res: express.Response) => {
  let freeroomsData = {};

  if (!timetableData["T1"]) {
    res.send(freeroomsData);
  }

  for (let course of timetableData["T1"]) {
    let courseCode = course["courseCode"];
    let courseName = course["name"];
    for (let classData of course["classes"]) {
      if (classData["mode"] != "In Person") {
        continue;
      }

      for (let timeElement of classData["times"]) {
        let [roomName, locationId] = timeElement["location"].split(" (");
        let [campus, buildingId, roomId] = locationId.split("-");

        if (!roomId) {
          continue;
        }

        buildingId = campus + "-" + buildingId;
        roomId = roomId.slice(0, -1);

        let day = timeElement["day"];
        let start = timeElement["time"]["start"];
        let end = timeElement["time"]["end"];
        let weeks = timeElement["weeks"];
        // case 1: "weeks": "11"
        // case 2: "weeks": "1-11",
        // case 3: "weeks": "3, 5, 7"
        // case 4: "weeks": "1-2, 3-5, 7-10"
        // case 5:"weeks": "1-2, 4, 5-7"
        let allWeeks = weeks.split(",");

        for (let tuple in allWeeks) {
          if (allWeeks[tuple].includes("-")) {
            // case 1: tuple is a range eg. 1-2
            let [startRange, endRange] = allWeeks[tuple].split("-");
            // turn string into a decimal number after splitting
            let startR = parseInt(startRange);
            let endR = parseInt(endRange);
            for (let currentWeek = startR; currentWeek <= endR; currentWeek++) {
              inputData(
                freeroomsData,
                buildingId,
                roomId,
                roomName,
                currentWeek,
                day,
                start,
                end,
                courseCode,
                courseName
              );
            }
          } else {
            // case 2: tuple is an integer eg. 5
            let currentWeek = parseInt(allWeeks[tuple]);
            inputData(
              freeroomsData,
              buildingId,
              roomId,
              roomName,
              currentWeek,
              day,
              start,
              end,
              courseCode,
              courseName
            );
          }
        }
      }
    }
  }

  res.send(freeroomsData);
};

function inputData(
  freeroomsData,
  buildingId,
  roomId,
  roomName,
  currentWeek,
  day,
  start,
  end,
  courseCode,
  courseName
) {
  if (!(buildingId in freeroomsData)) {
    freeroomsData[buildingId] = {};
  }
  if (!(roomId in freeroomsData[buildingId])) {
    freeroomsData[buildingId][roomId] = {};
  }
  if (!(roomName in freeroomsData[buildingId][roomId])) {
    freeroomsData[buildingId][roomId]["name"] = roomName;
  }
  if (!(currentWeek in freeroomsData[buildingId][roomId])) {
    freeroomsData[buildingId][roomId][currentWeek] = {};
  }
  if (!(day in freeroomsData[buildingId][roomId][currentWeek])) {
    freeroomsData[buildingId][roomId][currentWeek][day] = [];
  }
  freeroomsData[buildingId][roomId][currentWeek][day].push({
    courseCode: courseName,
    start: start,
    end: end,
  });
}

app.get("/api/terms/:termId/courses/:courseId", getCourse);
app.get("/api/terms/:termId/courses", getCourseList);
app.get("/api/freerooms", getFreeroomsData);
//app.get('/api/', getAllData);

app.use((_, res, next) => {
  // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}.`);
  console.log("Press ctrl-c to stop.");
});
