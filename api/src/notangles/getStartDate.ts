import * as express from "express";
import { getLatestTermName, getTermStartDate } from "../helper/getTermDataInfo";

/**
 * Get the latest term start date from data.json
 */
const getStartDate = () => {
    try {
        // Get the latest term and check the first class of the term
        // The assumption is that the starting date is the start date of the first class
        // of the term.
        const mostRecentTerm = getLatestTermName();

        const termStartDate = getTermStartDate(mostRecentTerm);
        return termStartDate;
    } catch (e) {
        return undefined;
    }
};

export { getStartDate };
