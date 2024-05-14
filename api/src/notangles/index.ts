import * as express from "express";
import { getLatestTermName, getTermStartDate } from "../helpers/getTermDataInfo";
import { data } from "../load-data";

const errorMessage = "Invalid termId/courseId param";

// Express routes

// The following routes should match what our current server sends. For example:
// - https://timetable.csesoc.unsw.edu.au/api/terms/2021-T2/courses/
// - https://timetable.csesoc.unsw.edu.au/api/terms/2021-T2/courses/COMP1511

// Note: we no longer need the "_id" key, so that can be omitted.

// The data in the variable `data.timetableData` is mostly in the right format
// already, so you shouldn't need to do much processing on it.

// Sends json data for the given course in the given year and term:
// (for the data format, see "Example Extracted Data" in README.md)
const getCourse = (req: express.Request, res: express.Response) => {
  // Access the timetable data object with:
  // - data.timetableData

  // Access the url parameters with:
  // - req.params.termId (e.g. 2021-T2)
  // - req.params.courseId (e.g. COMP1511)

  try {
    const term = req.params.termId.substring(5);
    const course = req.params.courseId;

    const termCourses = data.timetableData[term];

    if (termCourses) {
      for (let i = 0; i < termCourses.length; i++) {
        if (course == termCourses[i].courseCode) {
          res.json(termCourses[i]);
          return;
        }
      }
    }

    res.status(400).send(errorMessage);
  } catch (_) {
    res.status(400).send("Error");
  }
};

// Sends json data for a summary of courses in the given term:
// [{"courseCode":"COMP1511","name":"Programming Fundamentals"},...]
const getCourseList = (req: express.Request, res: express.Response) => {
  // Access the timetable data object with:
  // - data.timetableData

  // Access the url parameters with:
  // - req.params.termId (e.g. 2021-T2)

  try {
    const term = req.params.termId.substring(5);
    const termCourses = data.timetableData[term];
    const resCourses = { lastUpdated: data.lastUpdated, courses: [] };

    if (termCourses) {
      for (let i = 0; i < termCourses.length; i++) {
        const courseSummary = {
          courseCode: termCourses[i].courseCode,
          name: termCourses[i].name,
          career: termCourses[i].career,
          online: false,
          inPerson: false,
        };

        const classes = termCourses[i].classes;

        if (classes) {
          let locations = [];

          classes.forEach((classData) => {
            locations = [
              ...locations,
              ...classData.times.map((time) => time.location).filter((location) => location),
            ];
          });

          courseSummary.online = locations.some((location) => location.includes("Online"));

          courseSummary.inPerson = locations.some((location) => !location.includes("Online"));
        }

        resCourses.courses.push(courseSummary);
      }

      // forcing client to revalidate cache if data has changed
      res.set('Cache-Control', 'must-revalidate');
      res.json(resCourses);
    } else {
      res.status(400).send(errorMessage);
    }
  } catch (_) {
    res.status(400).send("Error");
  }
};

/**
 * Get the latest term start date from data.json
 */
const getLatestStartDate = (req: express.Request, res: express.Response) => {
  try {
    // Get the latest term and check the first class of the term
    // The assumption is that the starting date is the start date of the first class
    // of the term.
    const mostRecentTerm = getLatestTermName();

    res.send(getTermStartDate(mostRecentTerm));
  } catch (e) {
    res.status(400).send("Error");
  }
};

export { getCourse, getCourseList, getLatestStartDate };
