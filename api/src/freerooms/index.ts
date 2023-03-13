import * as express from "express";
import { getLatestTermName, getTermStartDate, termArray } from "../helpers/getTermDataInfo";
import { data } from "../load-data";
import { DateTime } from "luxon";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getFreeroomsData = (req: express.Request, res: express.Response) => {
  try {
    const term = req.params.termId.substring(5);
    const termData = data.timetableData[term];
    const termStart = getTermStartDate(term);

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
              let startWeek = parseWeek(startRange);
              let endWeek = parseWeek(endRange);

              for (let currentWeek = startWeek; currentWeek <= endWeek; currentWeek++) {
                inputData(
                  freeroomsData,
                  termStart,
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
              let currentWeek = parseWeek(allWeeks[week]);
              if (isNaN(currentWeek)) continue;

              inputData(
                freeroomsData,
                termStart,
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

/**
 * Parse week to integer.
 * Converts weeks N1..N4 to 11..14
 */
const parseWeek = (week: string) => parseInt(week.replace("N", "1"));

const inputData = (
  freeroomsData: {},
  termStart: string,
  buildingId: string,
  roomId: string,
  roomName: string,
  currentWeek: number,
  day: string,
  startTime: string,
  endTime: string,
  courseCode: string,
) => {
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
    start: toUTCString(termStart, currentWeek, day, startTime),
    end: toUTCString(termStart, currentWeek, day, endTime),
  });
};

/**
 * Converts a class start/end time to UTC ISO format (YYYY-MM-DDThh:mm:ssZ)
 * @param termStart term start date in DD/MM/YYYY format
 * @param week week number
 * @param day day in shortened form e.g. "Mon", "Thu"
 * @param time time in 24hr HH:MM format
 */
const toUTCString = (
    termStart: string,
    week: number,
    day: string,
    time: string
) => {
  return DateTime.fromFormat(termStart + time, "dd/MM/yyyyHH:mm")
      .setZone("Australia/Sydney")
      .plus({weeks: week - 1})
      .set({weekday: DAYS.indexOf(day)})
      .toUTC()
      .toISO();
}

/**
 * Get the appropriate term date for Freerooms. It will get the current
 * term date and not the new term date.
 */
const getStartDate = () => {
  try {
    return getTermStartDate(getCurrentTermNameData());
  } catch (e) {
    return undefined;
  }
};

/**
 * Get the appropriate term date for Freerooms. It will get the current
 * term date and not the new term date.
 */
const getCurrentTermNameData = () => {
  try {
    // Get the latest term and check the first class of the term
    // The assumption is that the starting date is the start date of the first class
    // of the term.
    const mostRecentTerm = getLatestTermName();
    const termStartDate = getTermStartDate(mostRecentTerm);
    const currDate = new Date();
    const regexp = /(\d{2})\/(\d{2})\/(\d{4})/;
    let day: number, month: number, year: number;
    const matched = termStartDate.match(regexp);
    if (matched != null) {
      [, day, month, year] = matched;
    } else {
      return undefined;
    }
    const termStartDateObj = new Date(year, month - 1, day);

    // Getting the difference in time so Freerooms gets the most recent term start date when
    // it starts.
    const isCurrentTerm = currDate.valueOf() - termStartDateObj.valueOf() >= 0;
    // If the data is more than a day old, we will return the term start date that is for the
    // new term, else we get the date for the old term.
    if (isCurrentTerm) {
      return mostRecentTerm;
    } else {
      // Checking if the term is the first term, we can have case when index out of bounds
      // as next year's summer rolls over.
      let dummyTerm = Math.max(termArray.findIndex((term) => term === mostRecentTerm) - 1, 0);
      return termArray[dummyTerm];
    }
  } catch (e) {
    return undefined;
  }
};

export { getFreeroomsData, getStartDate, getCurrentTermNameData };
