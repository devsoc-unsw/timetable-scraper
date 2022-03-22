const axios = require("axios");

import { timetableScraper } from "./scraper";
import { year } from "./config";

const port = process.env.PORT || 3001;

(async () => {
  const url = `http://localhost:${port}/internal/scrape`;
  const data = await timetableScraper(year);
  const res = await axios.post(url, data);

  if (res.status === 400) {
    console.error("Error");
  }
})();
