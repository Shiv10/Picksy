import dotenv from "dotenv";
import { app, server } from "./app";

import { logger } from "./tools/loggers";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3001;

app.listen(port, () => {
	logger.info(`Express server started at port: ${port}`);
});

server.listen(port + 1, () => {
	logger.info(`Sockets server started at port: ${port + 1}`);
});
