import * as express from "express";
import * as notangles from "./notangles/index";
import * as freerooms from "./freerooms/index";

const app = express();
const port = process.env.PORT || 3001;

app.get("/api/terms/:termId/courses/:courseId", notangles.getCourse);
app.get("/api/terms/:termId/courses", notangles.getCourseList);
app.get("/api/terms/:termId/freerooms", freerooms.getFreeroomsData);
//app.get('/api/', getAllData);

app.use((_, res, next) => {
  // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}.`);
  console.log("Press ctrl-c to stop.");
});
