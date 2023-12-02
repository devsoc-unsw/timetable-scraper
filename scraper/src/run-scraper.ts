import axios from "axios";
import { timetableScraper } from "./scraper";
import { year } from "./config";
import { getMergedTimetableData } from "./scraper-helpers/HandleTermData";

const url = process.env.API_URL || "http://localhost:3001/internal/scrape";

(async () => {
  let data = await timetableScraper(year);
  const nextYearsData = await timetableScraper(year + 1);

  if (!data) return; // There is a problem if it is a return here
  if (nextYearsData) {
    const minUpdated = Math.min(nextYearsData.lastUpdated, data.lastUpdated);
    data.courseWarnings.concat(nextYearsData.courseWarnings);
    data.timetableData = getMergedTimetableData(data.timetableData, nextYearsData.timetableData);
    data.lastUpdated = minUpdated;
  }
  const res = await axios({
    method: "post",
    url,
    data,
    maxContentLength: 100000000,
    maxBodyLength: 100000000,
  });

  if (res.status === 400) {
    console.error("Error");
  }
})();
