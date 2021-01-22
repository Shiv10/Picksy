import User from "../models";
import constants from "../tools/constants";
import { logger } from "../tools/loggers";

const whitelist = process.env.NODE_ENV === "production" ? Object.values(constants.url) : Object.values(constants.urlDev);
logger.info((whitelist));

export default {
	origin(origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};
