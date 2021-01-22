import mongoose from "mongoose";
import { logger } from "../tools/loggers";

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/piksy";

logger.info("Establish new connection with url", url);

mongoose.Promise = global.Promise;
mongoose.set("useNewUrlParser", true);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(url);

const db = mongoose.connection;

db.on("error", () => {
	logger.info(`> error occurred from the Database Connection to ${url}`);
});
db.once("open", () => {
	logger.info(`> successfully opened the Database Connection to ${url}`);
});

export default mongoose;
