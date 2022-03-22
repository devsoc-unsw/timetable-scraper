const fs = require("fs").promises;
import * as express from "express";
import { dataPath } from "../scraper/config";

const writeData = async (req: express.Request, res: express.Response) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(req.body));
    res.send("OK");
  } catch (_) {
    res.status(400).send("Error");
  }
};

export { writeData };
