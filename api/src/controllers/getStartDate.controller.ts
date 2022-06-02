import * as express from "express";
import * as notangles from "../notangles/index";
import * as freerooms from "../freerooms/index";

/**
 * Controller for getting the start date of the latest term for
 * Freerooms and Notangles.
 * @param req
 * @param res
 */

const getStartDateByRouteParams = (req: express.Request, res: express.Response) => {
    try {
        const client = req.params.client;
        if (client === "notangles") {
            return res.send(notangles.getStartDate(req, res));
        } else if (client === "freerooms") {
            return res.send(freerooms.getStartDate(req, res));
        }
    } catch (e) {
        res.status(400).send("Error");
    }
};
export { getStartDateByRouteParams };
