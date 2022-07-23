import axios from "axios";
import { timetableScraper } from "./scraper";
import { year } from "./config";

const url = process.env.API_URL || "http://localhost:3001/internal/scrape";

(async () => {
  const data = await timetableScraper(year);

  if (!data) return;

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
