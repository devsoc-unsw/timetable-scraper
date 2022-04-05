import axios from "axios";
import { timetableScraper } from "./scraper";
import { year } from "./config";

const url = process.env.API_URL || "http://localhost:3001/internal/scrape";


(async () => {
    const data = await timetableScraper(year);

    if (!data) return;

    const res = await axios.post(url, data);

    if (res.status === 400) {
        console.error("Error");
    }
})();

