import { promises as fs } from "fs";
import * as express from "express";
import { dataLocation } from "./load-data";

const writeData = async (req: express.Request, res: express.Response) => {
    try {
        await fs.writeFile(dataLocation, JSON.stringify(req.body));
        res.send("OK");
    } catch (_) {
        res.status(400).send("Error");
    }
};

export { writeData };
