import { getLatestTermName, getTermStartDate, termArray } from "../helper/getTermDataInfo";
import { getCurrentTermName } from "./getCurrentTermName";

/**
 * Get the appropriate term date for Freerooms. It will get the current
 * term date and not the new term date.
 */
const getStartDate = () => {
    try {
        return getTermStartDate(getCurrentTermName());
    } catch (e) {
        return undefined;
    }
};

export { getStartDate };
