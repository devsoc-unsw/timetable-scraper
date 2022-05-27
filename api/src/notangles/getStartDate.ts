import * as express from "express";
import { getLatestTermName, getTermStartDate } from "../helper/getTermDataInfo";

/**
 * Get the latest term start date from data.json
 */
const getStartDate = (req: express.Request, res: express.Response) => {
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

export { getStartDate };
