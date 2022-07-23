import * as express from "express";
import { data } from "../load-data";
export const FIRST_COURSE = 0;
export const termArray: string[] = ["Summer", "T1", "T2", "T3"];
const COURSE_OFFERED_EVERY_TERM = "ECON1101";

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
 * Get the latest term start date from data.json
 */
const getAvailableTermData = (req: express.Request, res: express.Response) => {
    try {
        return res.send(getLatestTermName());
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
                if (!isClassFound(termId, COURSE_OFFERED_EVERY_TERM)) {
                    break;
                }
                term = termId;
            }
        }

        return term;
    } catch (e) {
        console.error("There was an error getting the most updated term!");
        return undefined;
    }
};

const isClassFound = (termId: string, courseCode: string) => {
    const timetableData = data.timetableData;
    return timetableData[termId].some(
        (course: { courseCode: string }) => course.courseCode === courseCode,
    );
};

const getTermStartDate = (termId: string) => {
    try {
        console.log(termId);
        // Get the latest term and check the first class of the term
        // The assumption is that the starting date is the start date of the first class
        // of the term.
        const termStartDate =
            data.timetableData[termId][FIRST_COURSE]["classes"][0]["termDates"]["start"];
        return termStartDate;
    } catch (e) {
        console.error("There was an error getting the term start date!");
        return undefined;
    }
};

export { getAvailableTermData, getTermStartDate, isClassFound, getLatestTermName };
