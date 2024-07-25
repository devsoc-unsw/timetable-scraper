import { CheerioAPI } from 'cheerio';

import { CourseHead } from "../../scraper-helpers/interfaces";
import { transformHtmlSpecials } from "./class-scraper/class-helpers/TransformHtmlSpecials";

/**
 * Extracts the course header information, and splits it into the course code and name
 * @param { CheerioAPI } $: Cheerio API loaded with page that is to be evaluated
 * @returns { RegExpExecArray }: Runs the regex to extract data on the extracted data and returns the array
 */
const extractCourseHeadFromPage = async ($: CheerioAPI): Promise<RegExpExecArray> => {
  const courseHeader = $(".classSearchMinorHeading").first().text();
  const headerRegex = /(^[A-Z]{4}[0-9]{4})(.*)/;
  return headerRegex.exec(courseHeader);
}

/**
 * Gets the data from the title of the course (course code, name)
 * @param { CheerioAPI } $: Cheerio API loaded with page which displays the data to scrape
 * @returns { Promise<CourseHead> }: Data about the title of the course: The course code and the course name
 */
const getCourseHeadChunk = async ($: CheerioAPI): Promise<CourseHead> => {
  const data = await extractCourseHeadFromPage($);
  // There must be at least 3 elements in courseHead
  if (!(data && data.length > 2)) {
    throw new Error(`Malformed course header: ${data}`);
  }
  const courseHead: CourseHead = {
    courseCode: data[1].trim(),
    name: transformHtmlSpecials(data[2].trim()),
  };
  return courseHead;
};

export { getCourseHeadChunk };
