import { cloneDeep } from "lodash";

import { CourseWarning, ExtendedTerm, OtherTerms, TimetableData, } from "./scraper-helpers/interfaces";
import { getTermFromCourse } from "./scraper-helpers/GetTermFromCourse";
import { getUrls } from "./scraper-helpers/GetUrls";
import { scrapePage } from "./page-scraper/PageScraper";
import { keysOf } from "./scraper-helpers/KeysOf";

/**
 * The scraper that scrapes the timetable site
 *
 * @param {number} year - The year for which the information is to be scraped
 * @returns {Promise<{ timetableData: TimetableData; warnings: Warning[] }} The data that has been scraped, grouped into one of 6 terms. If the scraper is unable to classify courses, then it will group them under 'Other'
 * @returns {false}: Scraping failed due to some error. Error printed to console.error
 * @example
 * 1.
 *    const data = await timetableScraper(2020)
 *    console.log(data.timetableData.T1) // Expect list of T1 courses in 2020
 * 2.
 *    const data = await timetableScraper(40100)
 *    console.log(data) // false
 */
const timetableScraper = async (
  year: number,
): Promise<
  | {
      timetableData: TimetableData;
      courseWarnings: CourseWarning[];
      lastUpdated: number;
    }
  | false
> => {
  try {
    // Base url to be used for all scraping
    const base = `http://timetable.unsw.edu.au/${year}/`;

    // JSON Array to store the course data.
    // There are no cases which cannot be classified. (Yet)
    const timetableData: TimetableData = {
      Summer: [],
      T1: [],
      T2: [],
      T3: [],
      S1: [],
      S2: [],
      Other: [],
    };

    // CourseWarning array for any fields not aligning with the strict requirements
    const courseWarnings: CourseWarning[] = [];

    // Defining the regex for course scraping...
    const courseUrlRegex = /([A-Z]{8})\.html/;

    // Gets all the dataurls on the page with list of subjects (Accounting, Computers etc)
    const urlList = await getUrls({
      url: base,
      base,
      regex: courseUrlRegex,
    });

    // Defining the regex for each of the subject codes...
    const subjectUrlRegex = /([A-Z]{4}[0-9]{4})\.html/;

    // List of promises that are being resolved
    const promises: Promise<string[]>[] = [];

    // Scrape all the urls from the subject pages (eg: COMPKENS, etc)
    for (let i = 0; i < urlList.length; i++) {
      // Open a different url on a different page
      const urls = getUrls({
        url: urlList[i],
        base,
        regex: subjectUrlRegex,
      });
      promises.push(urls);
    }

    // Wait for all the pages
    const result = await Promise.all(promises);

    // Jobs -> urls of each subject
    const jobs = result.flat();

    const batchsize = 50;

    // Now scrape each page in the jobs queue and then add it to the scraped
    // array
    for (let job = 0; job < jobs.length; ) {
      const promises: Promise<{
        coursesData: TimetableData;
        courseWarnings: CourseWarning[];
      }>[] = [];
      for (let i = 0; i < batchsize && job < jobs.length; i++) {
        const data = scrapePage(jobs[job]);
        promises.push(data);
        job++;
      }
      // Wait for all the pages
      const result = await Promise.all(promises);

      for (const element of result) {
        courseWarnings.push(...element.courseWarnings);
        for (const scrapedTerm of keysOf(element.coursesData)) {
          // Each termlist may contain multiple courses
          for (const scrapedCourse of element.coursesData[scrapedTerm]) {
            if (!scrapedCourse) {
              throw new Error(`Error in result: ${JSON.stringify(element)}`);
            }
            // If the term is in the other list, then it has no classes. Classify it!
            if (scrapedTerm === OtherTerms.Other) {
              const termlist: ExtendedTerm[] = getTermFromCourse({
                course: scrapedCourse,
              });
              if (!termlist.length) {
                termlist.push(OtherTerms.Other);
              }
              const { notes } = scrapedCourse;
              const noteIndex = 0;
              for (const term of termlist) {
                if (notes?.[noteIndex] && notes[noteIndex] != " ") {
                  scrapedCourse.notes = [notes[noteIndex]];
                } else {
                  delete scrapedCourse.notes;
                }

                timetableData[term].push({
                  ...cloneDeep(scrapedCourse),
                });
              }
            } else {
              // If the term is already assigned then just add it to the respective term.
              timetableData[scrapedTerm].push(scrapedCourse);
            }
          }
        }
      }
    }

    // Close the browser.
    return {
      timetableData,
      courseWarnings,
      lastUpdated: Date.now(),
    };
  } catch (err) {
    // Log error and close browser.
    console.error(err);
    return false;
  }
};

export { timetableScraper };
