import { Schema } from "mongoose";

const scoreSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	points: {
		type: Number,
		required: true,
	},
});

export default scoreSchema;
