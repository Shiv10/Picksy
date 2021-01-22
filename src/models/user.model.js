import mongoose from "mongoose";
import db from "./db";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
		},
		password: {
			type: String,
		},
		roles: {
			type: [String],
			default: ["user"],
		},
		points: {
			type: Number,
			default: 0,
		},
		matchesPlayed: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true },
);

const User = db.model("User", userSchema);
export default User;
