import { load, Element, SelectorType } from 'cheerio'
import { Chunk, ClassChunk, PageData } from "../scraper-helpers/interfaces";

/**
 * Parses the tables on the page, extracts the courses on the page as chunks
 * @param { Element[] } elements: List of table elements on the page that need to be parsed
 * @returns { PageData[] }: List of course chunks, classified as a pageData object
 */
const parsePage = (elements: Element[]): PageData[] => {
  /**
   * Extracts the tables on the page containing course data
   * @param { Element[] } courseTables: List of all the tables on the page
   * @returns { Element[][] }: List of elements that contain data about a course, group together so each list only contains chunks relevant to one course
   */
  const getCourseElements = (courseTables: Element[]): Element[][] => {
    const elementList: Element[][] = [];

    for (const course of courseTables) {
      // Get every td which has more than 1 table
      const $ = load(course);
      const subtables = $('table').get();
      if (subtables.length > 1) {
        elementList.push(subtables);
      }
    }

    return elementList;
  };

  /**
   * Finds and extracts notes from the class chunk
   * Relies on the fact that notes follow "Class Notes" header
   * @param subtable: Table tag equivalent to a class chunk
   */
  const getClassNotes = (subtable: Element): string[] => {
    const $ = load(subtable);
    const notes = $('td.label[colspan="5"], font[color="red"]')
      .map((_, element) => $(element).text().replace(/\s+/g, ' ').trim())
      .get();
    const noteStartIndex = notes.indexOf("Class Notes");
    let noteCount = 0;
    let classNotes: string[] = [];
    if (noteStartIndex > -1) {
      noteCount = noteStartIndex > -1 ? notes.length - 1 - noteStartIndex : 0;
      classNotes = noteCount > 0 ? notes.splice(noteStartIndex + 1) : [];
    }

    return classNotes;
  };

  interface GetClassTablesParams {
    subtables: Element[];
    dataClassSelector: SelectorType;
  }

  /**
   * Extracts all the classChunks from the page
   * @param { Element[]} subtables: List of table elements that contain one class chunk each
   * @param { SelectorType } dataClassSelector: selector to extract elements with the data class
   * @returns { ClassChunk[] }: List of class chunks that were extracted
   */
  const getClassTables = ({ subtables, dataClassSelector }: GetClassTablesParams): ClassChunk[] => {
    // The table represents a classlist!! -> the split chunks are then each element of subtables...

    // const notes = getClassesNotes(subtables)
    const tablelist: ClassChunk[] = [];
    for (const subtable of subtables) {
      // classNotes.push(getClassNotes(subtable))
      const $ = load(subtable);
      const data = $(dataClassSelector)
        .map((_, element) => $(element).text().replace(/\s+/g, ' ').trim())
        .get();
      const notes = getClassNotes(subtable);
      tablelist.push({
        data: data.slice(0, data.length - notes.length),
        notes,
      });
    }
    return tablelist;
  };

  interface GetCourseInfoChunkParams {
    courseInfoElement: Element;
    dataClassSelector: SelectorType;
  }

  /**
   * Extracts course info chunk from the page
   * @param { Element } courseInfoElement: The dom element that contains the courseInfo chunk
   * @param { SelectorType } dataClassSelector: selector to extract dom elements with the data class
   * @returns { Chunk }: Extracted courseInfo chunk
   */
  const getCourseInfoChunk = ({
    courseInfoElement,
    dataClassSelector,
  }: GetCourseInfoChunkParams): Chunk => {
    // This should be the course info table. --> get data elements
    const $ = load(courseInfoElement);
    return {
      data: $(dataClassSelector)
        .map((_, element) => $(element).text().replace(/\s+/g, ' ').trim())
        .get()
    };
  }

  /**
   * Checks if the element contains a class chunk or not
   * @param { Element } element: Chunk to be checked
   * @returns { boolean }: true, if the element contains a class chunk, otherwise false
   */
  const hasClassChunk = (element: Element): boolean => {
    // If the table has any element with id top, then it is the classes table.
    const $ = load(element);
    const classQuery: SelectorType = 'a[href="#top"]';
    return $(classQuery).length !== 0;
  };

  /**
   * Checks if the element has a note and no useful data
   * @param { Element } element: The dom element to be checked
   * @returns { boolean }: true, if the element has a note dom element, false otherwise
   */
  const isNoteElement = (element: Element): boolean => {
    const $ = load(element);
    const noteClassSelector: SelectorType = ".note";
    return $(noteClassSelector).length !== 0;
  };

  /**
   * Checks if the subtables indicate that the parent might contain a course info chunk
   * @param { Element[] } subtables: The subtables that might be part of the table element that contains a courseInfoChunk
   * @returns { boolean }: true, if the parent contains a course info chunk, false otherwise
   */
  const hasCourseInfoChunk = (subtables: Element[]): boolean =>
    subtables.length === 3;

  interface ExtractChunksReturn {
    courseInfoChunk?: Chunk;
    classChunks?: ClassChunk[];
  }

  /**
   * Extracts the course info and class chunks (if present) from the element
   * @param { Element } element: Dom element to extract chunks from
   * @returns { ExtractChunksReturn }: The extracted course info and class chunks, if found
   */
  const extractChunks = (element: Element): ExtractChunksReturn => {
    const $ = load(element);
    const dataClassSelector: SelectorType = ".data";
    const pathToInnerTable: SelectorType = ":root > tbody > tr > td > table";
    const subtables: Element[] = $(pathToInnerTable).get();

    if (hasClassChunk(element)) {
      return {
        classChunks: getClassTables({ subtables, dataClassSelector }),
      };
    }
    if (isNoteElement(element)) {
      // The table is the summary table ---> skip!
    } else if (hasCourseInfoChunk(subtables)) {
      return {
        courseInfoChunk: getCourseInfoChunk({
          courseInfoElement: element,
          dataClassSelector,
        }),
      };
    }
    // Else -> other heading tables ---> skip!

    // Default
    return {};
  };

  /**
   * Extracts chunks from list of elements relating to a single course
   * @param { Element[]} elements: list of elements relating to a single course
   * @returns { PageData }: extracted courseInfo and courseClasses chunks, formatted as a PageData object
   */
  const parseCourse = (elements: Element[]): PageData => {
    const dataClassSelector: SelectorType = ".data";

    const courseClasses: ClassChunk[] = [];
    let courseInfo: Chunk;
    for (const element of elements) {
      // If there are any data fields inside the chunk, then categorize it
      const $ = load(element);
      const data: Element = $(dataClassSelector).get(0);
      if (data) {
        const { classChunks, courseInfoChunk } = extractChunks(element);

        if (courseInfoChunk) {
          courseInfo = courseInfoChunk;
        }

        if (classChunks?.length > 0) {
          courseClasses.push(...classChunks);
        }
      }
    }

    return { courseInfo, courseClasses };
  };

  const courseElements = getCourseElements(elements);
  const pageChunks: PageData[] = [];

  for (const element of courseElements) {
    const { courseInfo, courseClasses } = parseCourse(element);

    if (courseClasses?.length > 0) {
      pageChunks.push({
        courseInfo,
        courseClasses,
      });
    } else {
      pageChunks.push({ courseInfo });
    }
  }
  return pageChunks;
};

export { parsePage };
