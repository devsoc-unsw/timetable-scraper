/**
 * Extracts the name of the faculty that offers the course that is being parsed
 * @param faculty: Line that contains data about the faculty field
 * @returns { string }: The faculty that offers the current course
 */
const getFaculty = (faculty: string): string => {
    // Faculty is a string
    if (!faculty || faculty === " ") {
        console.error(new Error(`Invalid Faculty: ${faculty}`));
    }

    return faculty;
};

export { getFaculty };
