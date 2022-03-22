import { Chunk, CourseInfo } from "../../scraper-helpers/interfaces";

import { isCensusDate } from "./chunk-helpers/IsCensusDate";
import { isTerm } from "./chunk-helpers/IsTerm";
import { getSchool } from "./chunk-helpers/GetSchool";
import { getCampusLocation } from "./chunk-helpers/GetCampusLocation";
import { getCareer } from "./chunk-helpers/GetCareer";

/**
 * @interface: Indices of all the data that can be extracted from the courseInfo chunk
 */
interface CourseInfoIndices {
    facultyIndex?: number;
    schoolIndex: number;
    onlineHandbookRecordIndex?: number;
    campusIndex: number;
    careerIndex: number;
    nextParseIndex: number; // Index to start looking for term, censusDates and notes information
}

/**
 * @constant { CourseInfoIndices }: Default indices which represent which index to grab data from.
 * The schoolIndex is not 0 because there is a column for an &nbsp in the table
 */
const defaultParseIndices: CourseInfoIndices = {
    schoolIndex: 1,
    campusIndex: 3,
    careerIndex: 4,
    nextParseIndex: 5,
};

interface parseCourseInfoChunkParams {
    chunk: Chunk;
    parseIndices?: CourseInfoIndices;
}

interface parseCourseInfoChunkReturn {
    notes: string[];
    courseInfo: CourseInfo;
}

/**
 * Scrapes all information, given a data array from a chunk that contains
 * course information for one course
 * @param { Chunk } chunk: Data array that contains the course information
 * @returns { { notes: string[]; courseInfo: CourseInfo } }: A CourseInfo object containing data about the course and a list of notes on the page, if any.
 */
const parseCourseInfoChunk = ({
    chunk,
    parseIndices = defaultParseIndices,
}: parseCourseInfoChunkParams): parseCourseInfoChunkReturn => {
    const { data } = chunk;
    const school = getSchool(data[parseIndices.schoolIndex]);
    const campus = getCampusLocation(data[parseIndices.campusIndex]);
    const career = getCareer(data[parseIndices.careerIndex]);

    let index = parseIndices.nextParseIndex;
    const termsOffered: string[] = [];
    const censusDates: string[] = [];
    const notes: string[] = [];
    // Find all the terms the course runs in
    while (index < data.length) {
        if (isTerm(data[index])) {
            termsOffered.push(data[index]);
        }

        if (isCensusDate(data[index])) {
            censusDates.push(data[index]);
            notes.push(data[index + 1]);
        }
        index++;
    }

    const courseInfo: CourseInfo = {
        school,
        campus,
        career,
        termsOffered,
        censusDates,
    };

    return { notes, courseInfo };
};

export { parseCourseInfoChunk };
