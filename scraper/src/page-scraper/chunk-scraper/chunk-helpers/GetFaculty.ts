/**
 * Extracts the name of the school that offers the course that is being parsed
 * @param school: Line that contains data about the school field
 * @returns { string }: The school that offers the current course
 */
const getFaculty = (faculty: string): string => {
    // School is a string
    if (!faculty || faculty === " ") {
        console.error(new Error(`Invalid Faculty: ${faculty}`));
    }

    return faculty;
};

export { getFaculty };
