import * as express from "express";
import { data } from "./load-data";
const FIRST_COURSE: Number = 0;
const termArray: string[] = ["Summer", "T1", "T2", "T3"];

/**
 * Some notes on the start date for the automation:
 * To start of there are some assumptions which need to be documented:
 * 1) The course that is selected as the first class of the term is the one 
 * that is used to get the term date, after 
 * some sanity checks, it was concluded that it works!
 * 
 * 2) ECON1101 is the class of interest for which we check if a 
 *    particular term data is out or not This is because it 
 *    is offered every term. If this changes later, please
 *    do change this code.
 * 
 * 
 * -> There are two different start dates for the automation. 
 *    One for Notangles and the other for Freerooms.
 *    Notangles will get the most recent term start date.
 *    Freerooms will get the start date of the new term 
 *    only if the current date is after the start date of the term.
 *    this will mean that freerooms would not break in the older 
 *    term relative to the term the new data has been released for.
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
        const currTerm = term(); // Get the current term that has the most recent data.
        const termStartDate = data.timetableData[currTerm][FIRST_COURSE]["classes"][0]["termDates"]["start"];
        const currDate = new Date(); // We will check if the current date is after the 
                                     // term start date so Freerooms does not suffer.
        // Regex expression to match the timeDelta format.
        let regexp = /(\d{2})\/(\d{2})\/(\d{4})/;
        let day, month, year;
        let matched = termStartDate.match(regexp);
        if (matched != null) { 
            year = matched[3];
            month = matched[2];
            day = matched[1];
        } else { 
            res.send("Error getting the start date");
        }
        const termStartDateObj = new Date(year, month, day);
        // Getting the difference in time so Freerooms gets the most recent term start date when 
        // it starts.
        const timeDelta = (currDate.valueOf() - termStartDateObj.valueOf());
        
        if (timeDelta >= 0) {
            // If the data is more than a day old, we will return the term start date that is for the
            // new term, else we get the date for the old term.
            res.send(termStartDate);
        } else { 
            let dummyTerm = termArray.findIndex(term => term == currTerm) - 1;
            // Checking if the term is the first term, we can have case when index out of bounds.
            if (dummyTerm < 0) {
                dummyTerm = 0; // Sanity check to make sure the array does not break
                // Only time this will happen is when the next year's summer starts over.
            }
            const oldTermStartDate = data.timetableData[termArray[dummyTerm]][FIRST_COURSE]["classes"][0]["termDates"]["start"];
            res.send(oldTermStartDate);
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
        const termStartDate = data.timetableData[term()][FIRST_COURSE]["classes"][0]["termDates"]["start"];
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
        res.send(term());
    } catch (e) {
        res.status(400).send("Error");
    }
};

/**
 * Get the term which has data from data.json, this term 
 * is the latest term with data. This is exclusively for Notangles, so 
 * Freerooms please do not use it!
 * @returns the latest term number
 */
const term = () => {
    try {
            
            let term: string = "";
            for (let termId of termArray) {
                
                let timetableData = data.timetableData;
                // Check if the termId exists in the timetableData and the fields are actually
                // present. If they are, return the term as it is.
                if (timetableData.hasOwnProperty(termId)) {
                    if (!isClassFound(termId, 'ECON1101')) {
                        break;
                    }
                    term = termId;
                } 
            }

            return term;    
    } catch (e) {
        console.log("There was an error getting the most updated term!");
    }
};


const isClassFound = (termId: string, courseCode: string) => { 
    let timetableData = data.timetableData;
    for (let classData of timetableData[termId]) {
        if (classData.courseCode == courseCode) {
            return true;
        }
    }
    return false;
}

export { getStartDateNotangles, getStartDateFreerooms, getAvailableTermData };
