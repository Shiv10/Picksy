import dotenv from "dotenv";

dotenv.config();

export default {
	url: ["https://piksy.sauravmh.me", "https://pik-soc.sauravmh.me"],
	urlDev: [`http://localhost:${process.env.PORT}`, `http://localhost:${process.env.PORT}`],
	roundNum: 3,
	matchLen: 10000,
	wordSelOptions: 3,
	timeOfRound: 80000,
	playerPointFactor: 10,
	drawerPointFactor: 8,
	corsOptions: (req, res) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin":
				process.env.NODE_ENV === "production" ? "https://piksy.sauravmh.me" : `http://localhost:${process.env.PORT}`, // or the specific origin you want to give access to,
			"Access-Control-Allow-Credentials": true,
		};
		res.writeHead(200, headers);
		res.end();
	},
};
