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
        let response: string | undefined;
        if (client === "notangles") {
            response = notangles.getStartDate();
        } else if (client === "freerooms") {
            response = freerooms.getStartDate();
        }

        if (response === undefined) {
            res.status(400).send("Error");
        } else {
            res.send(response);
        }
    } catch (e) {
        res.status(400).send("Error, could not get the start date");
    }
};
export { getStartDateByRouteParams };
