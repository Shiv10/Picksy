import mongoose from "mongoose";

import db from "./db";
import userScore from "./userScore.schema";

const matchSchema = new mongoose.Schema({
	drawerUsername: {
		type: String,
		required: true,
	},
	roundNo: {
		type: Number,
		default: -1,
	},
	responses: {
		type: [userScore],
		required: true,
	},
	drawerPoints: {
		type: Number,
		default: 0,
	},
	suggestedWords: {
		type: [String],
		default: [],
	},
	choosenWord: {
		type: String,
		default: "",
	},
});

const Match = db.model("Match", matchSchema);
export default Match;
