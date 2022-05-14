import * as express from "express";
import { data } from "./load-data";
const FIRST_COURSE: Number = 0;

/**
 * Get the latest term start date from data.json
 */
const getStartDate = (req: express.Request, res: express.Response) => {
    try {
        const getAvailableTerm = (): string => { 
            let termArray: string[] = ["Summer", "T1", "T2", "T3"];
            let term: string = "";
            for (let termId of termArray) {
                
                let timetableData = data.timetableData;
                // Check if the termId exists in the timetableData and the fields are actually
                // present. If they are, return the term as it is.
                if (timetableData.hasOwnProperty(termId) && timetableData[termId].length > 0) {
                    term = termId;
                } else {
                    break;
                }
            
            }
            return term;
        }
        const term = getAvailableTerm();
        const termStartDate = data.timetableData[term][FIRST_COURSE]["classes"][0]["termDates"]["start"];
        res.send(termStartDate);
    
    } catch (e) {
        res.status(400).send("Error");
    }
};


export { getStartDate };

// TODO:
// Change dsn back to env path
// Change load data back to original path
// 