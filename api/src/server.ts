import express from "express";
import cors from "cors";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

import * as notangles from "./notangles/index";
import * as freerooms from "./freerooms/index";
import { writeData } from "./write-data";
import { getAvailableTermData, getStartDateFreerooms, getStartDateNotangles } from "./getStartDate";

const app = express();
const port = process.env.PORT || 3001;

// Sentry configurations
Sentry.init({
    dsn: `${process.env.SENTRY_INGEST_URL}`,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: Number(process.env.SENTRY_TRACE_RATE),
});
app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/terms/:termId/courses/:courseId", notangles.getCourse);
app.get("/api/terms/:termId/courses", notangles.getCourseList);
app.get("/api/terms/:termId/freerooms", freerooms.getFreeroomsData);
app.get("/api/startdate/freerooms", getStartDateFreerooms);

app.get("/api/startdate/notangles", getStartDateNotangles);
app.get("/api/availableterm/notangles", getAvailableTermData);

app.post("/internal/scrape", writeData);

app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);
app.use((err, req, res, next) => {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}.`);
    console.log("Press ctrl-c to stop.");
});
