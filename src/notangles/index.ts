import * as express from "express";
import { timetableData } from "../automatic-scraper";

const errorMessage = "Invalid termId/courseId param";

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

  const term = req.params.termId.substring(5);
  const course = req.params.courseId;

  console.log(timetableData);

  const termCourses = timetableData[term]; 
  
  if (termCourses) {
    for (let i = 0; i < termCourses.length; i++) {
      if (course == termCourses[i].courseCode) {
        res.json(termCourses[i]);
        return;
      }
    }
  }

  res.status(400).send(errorMessage);
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

  if (termCourses) {
    for (let i = 0; i < termCourses.length; i++) {
      const courseSummary = {
        courseCode: termCourses[i].courseCode,
        name: termCourses[i].name
      };

      resCourses.push(courseSummary);
    }

    res.json(resCourses);
  } else {
    res.status(400).send(errorMessage);
  }
};

export { getCourse, getCourseList };