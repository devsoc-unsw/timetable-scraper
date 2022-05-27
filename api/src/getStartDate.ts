import * as express from "express";
import { data } from "./load-data";
const FIRST_COURSE = 0;
const termArray: string[] = ["Summer", "T1", "T2", "T3"];

/**
 * Some notes on the start date for the automation:
 * To start off, there are some assumptions which need to be documented:
 *
 * 1)   The course that is selected as the first class of the term is the one
 *      that is used to get the term date, after
 *      some sanity checks, it was concluded that it works!
 *
 * 2)   ECON1101 is the class of interest for which we check if a
 *      particular term data is out or not. This is because it
 *      is offered every term. If this changes later, please
 *      do change this code.
 *
 *
 * -> There are two different start dates for the automation.
 *    One for Notangles and the other for Freerooms.
 *    Notangles will get the most recent term start date.
 *    Freerooms will get the start date of the new term only after the date is
 *    equal to the current date.
 *
 */

/**
 * Get the appropriate term date for Freerooms. It will get the current
 * term date and not the new term date.
 */
const getStartDateFreerooms = (req: express.Request, res: express.Response) => {
    try {
        // Get the latest term and check the first class of the term
        // The assumption is that the starting date is the start date of the first class
        // of the term.
        const mostRecentTerm = getLatestTermName();
        const termStartDate = getTermStartDate(mostRecentTerm);
        const currDate = new Date();
        const regexp = /(\d{2})\/(\d{2})\/(\d{4})/;
        let day, month, year;
        const matched = termStartDate.match(regexp);
        if (matched != null) {
            [, day, month, year] = matched;
        } else {
            res.status(400).send("Error getting the start date");
        }
        const termStartDateObj = new Date(year, month, day);
        // Getting the difference in time so Freerooms gets the most recent term start date when
        // it starts.
        const isCurrentTerm = currDate.valueOf() - termStartDateObj.valueOf() >= 0 ? true : false;
        // If the data is more than a day old, we will return the term start date that is for the
        // new term, else we get the date for the old term.
        if (isCurrentTerm) {
            res.send(termStartDate);
        } else {
            // Checking if the term is the first term, we can have case when index out of bounds
            // as next year's summer rolls over.
            let dummyTerm = Math.max(termArray.findIndex((term) => term === mostRecentTerm) - 1, 0);
            res.send(getTermStartDate(termArray[dummyTerm]));
        }
    } catch (e) {
        res.status(400).send("Error");
    }
};

/**
 * Get the latest term start date from data.json
 */
const getStartDateNotangles = (req: express.Request, res: express.Response) => {
    try {
        // Get the latest term and check the first class of the term
        // The assumption is that the starting date is the start date of the first class
        // of the term.
        const termStartDate = getTermStartDate(getLatestTermName());

        res.send(termStartDate);
    } catch (e) {
        res.status(400).send("Error");
    }
};

/**
 * Get the latest term start date from data.json
 */
const getAvailableTermData = (req: express.Request, res: express.Response) => {
    try {
        res.send(getLatestTermName());
    } catch (e) {
        res.status(400).send("Error");
    }
};

/**
 * Get the term which has data from data.json, this term
 * is the latest term with data. This is exclusively for finding
 * the latest term.
 * @returns the latest term name
 */
const getLatestTermName = () => {
    try {
        let term: string = "";
        for (let termId of termArray) {
            const timetableData = data.timetableData;
            // Check if the termId exists in the timetableData and the fields are actually
            // present. If they are, return the term as it is.
            if (timetableData.hasOwnProperty(termId)) {
                if (!isClassFound(termId, "ECON1101")) {
                    break;
                }
                term = termId;
            }
        }

        return term;
    } catch (e) {
        console.error("There was an error getting the most updated term!");
    }
};

const isClassFound = (termId: string, courseCode: string) => {
    const timetableData = data.timetableData;
    return timetableData[termId].some((course) => course.courseCode === courseCode);
};

const getTermStartDate = (termId: string) => {
    try {
        // Get the latest term and check the first class of the term
        // The assumption is that the starting date is the start date of the first class
        // of the term.
        const termStartDate =
            data.timetableData[termId][FIRST_COURSE]["classes"][0]["termDates"]["start"];
        return termStartDate;
    } catch (e) {
        console.error("There was an error getting the term start date!");
    }
};

export { getStartDateNotangles, getStartDateFreerooms, getAvailableTermData };
