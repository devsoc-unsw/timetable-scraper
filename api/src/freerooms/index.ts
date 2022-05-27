import * as express from "express";
import { data } from "../load-data";
import { getStartDate } from "./getStartDate";

const getFreeroomsData = (req: express.Request, res: express.Response) => {
    try {
        const term = req.params.termId.substring(5);
        const termData = data.timetableData[term];

        let freeroomsData = {};

        for (let course of termData) {
            let courseCode = course["courseCode"];

            let courseClasses = course["classes"];
            if (!courseClasses) continue;

            for (let classData of courseClasses) {
                if (classData["mode"] !== "In Person") continue;

                for (let timeElement of classData["times"]) {
                    let classLocation = timeElement["location"];
                    if (!classLocation) continue;

                    // An example location is UNSW Business School 219 (K-E12-219)
                    let [roomName, locationId] = classLocation.split(" (");
                    let [campus, buildingId, roomId] = locationId.split("-");
                    if (!roomId) continue;

                    buildingId = campus + "-" + buildingId;

                    // Remove trailing ) from room id
                    roomId = roomId.slice(0, -1);

                    let day = timeElement["day"];
                    let startTime = timeElement["time"]["start"];
                    let endTime = timeElement["time"]["end"];
                    let weeks = timeElement["weeks"];

                    // case 1: "weeks": "11" (single week)
                    // case 2: "weeks": "1-11" (one range of weeks)
                    // case 3: "weeks": "3, 5, 7" (list of individual weeks)
                    // case 4: "weeks": "1-2, 3-5, 7-10" (list of range of weeks)
                    // case 5: "weeks": "1-2, 4, 5-7" (list of both individual and range of weeks)

                    let allWeeks = weeks.split(",");

                    for (let week in allWeeks) {
                        if (allWeeks[week].includes("-")) {
                            // case 1: week is a range eg. 1-2
                            let [startRange, endRange] = allWeeks[week].split("-");

                            // turn string into a decimal number after splitting
                            // it will be converted back into a string when used as a key in the object
                            let startWeek = parseInt(startRange);
                            let endWeek = parseInt(endRange);

                            for (
                                let currentWeek = startWeek;
                                currentWeek <= endWeek;
                                currentWeek++
                            ) {
                                inputData(
                                    freeroomsData,
                                    buildingId,
                                    roomId,
                                    roomName,
                                    currentWeek,
                                    day,
                                    startTime,
                                    endTime,
                                    courseCode,
                                );
                            }
                        } else {
                            // case 2: week is an integer eg. 5
                            // turn string into a decimal number for consistency with case 1
                            let currentWeek = parseInt(allWeeks[week]);

                            inputData(
                                freeroomsData,
                                buildingId,
                                roomId,
                                roomName,
                                currentWeek,
                                day,
                                startTime,
                                endTime,
                                courseCode,
                            );
                        }
                    }
                }
            }
        }

        res.send(freeroomsData);
    } catch (_) {
        res.status(400).send("Error");
    }
};

function inputData(
    freeroomsData: {},
    buildingId: string,
    roomId: string,
    roomName: string,
    currentWeek: number,
    day: string,
    startTime: string,
    endTime: string,
    courseCode: string,
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
        courseCode: courseCode,
        start: startTime,
        end: endTime,
    });
}

export { getFreeroomsData, getStartDate };
