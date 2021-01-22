import "./models/db";

import express from "express";
import http from "http";
import { urlencoded, json } from "body-parser";
import cookieParser from "cookie-parser";
// import passport from "passport";
import session from "express-session";
import cors from "cors";

import { logger } from "./tools/loggers";
import constants from "./tools/constants";
import corsHandler from "./actions/middlewares";

import socketHandler from "./routes/socketHandler";
import auth from "./routes/auth";
import home from "./routes/home";
import gameLobby from "./routes/gameLobby";
import game from "./routes/game";

export const app = express();
export const server = http.Server(app);

const checkSession = (req, res, next) => {
	if (req.session.user.username === "") {
		res.redirect("/");
		return;
	}
	next();
};

socketHandler(server, constants.corsOptions);

app.set("view engine", "ejs");
app.set("views", `${__dirname}/../public/views`);
app.use("/static", express.static(`${__dirname}/../public/static`));

// app.use(passport.initialize());
// app.use(passport.session());

app.use(cors(corsHandler));
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(session({ secret: "Shh, its a secret!" }));
// app.use(ensureAuthenticated);

app.use("/auth", checkSession, auth);
app.use("/home", home); // The page where you add or create a room
app.use("/gameLobby", checkSession, gameLobby); // The waiting area before the game begins
app.use("/game", checkSession, game); // The page where you play the game

app.get("/", (req, res) => {
	req.session.user = {
		username: "",
	};
	res.render("landingPage");
});
