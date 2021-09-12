import * as express from "express";
import { timetableData } from "../load-data";

// Running: npx nodemon --exec TIMETABLE_YEAR=2020 npm start

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

export { getFreeroomsData };