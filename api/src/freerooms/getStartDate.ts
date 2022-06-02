import * as express from "express";
import { getLatestTermName, getTermStartDate, termArray } from "../helper/getTermDataInfo";

/**
 * Get the appropriate term date for Freerooms. It will get the current
 * term date and not the new term date.
 */
const getStartDate = () => {
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
        const termStartDateObj = new Date(year, month, day);
        // Getting the difference in time so Freerooms gets the most recent term start date when
        // it starts.
        const isCurrentTerm = currDate.valueOf() - termStartDateObj.valueOf() >= 0 ? true : false;
        // If the data is more than a day old, we will return the term start date that is for the
        // new term, else we get the date for the old term.
        if (isCurrentTerm) {
            return termStartDate;
            //res.send(termStartDate);
        } else {
            // Checking if the term is the first term, we can have case when index out of bounds
            // as next year's summer rolls over.
            let dummyTerm = Math.max(termArray.findIndex((term) => term === mostRecentTerm) - 1, 0);
            return getTermStartDate(termArray[dummyTerm]);
        }
    } catch (e) {
        return undefined;
    }
};

export { getStartDate };
