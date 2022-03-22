import express from "express";
import cors from "cors";
import * as notangles from "./notangles/index";
import * as freerooms from "./freerooms/index";
import { writeData } from "./write-data";

export const dataLocation = "/data/data.json";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/terms/:termId/courses/:courseId", notangles.getCourse);
app.get("/api/terms/:termId/courses", notangles.getCourseList);
app.get("/api/terms/:termId/freerooms", freerooms.getFreeroomsData);
app.post("/internal/scrape", writeData);

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}.`);
    console.log("Press ctrl-c to stop.");
});
