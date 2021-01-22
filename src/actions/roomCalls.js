import { logger } from "../tools/loggers";
import * as initVals from "./initFill";

export default class Room {
	constructor(options) {
		this.socket = options.socket;
		// this.rooms = options.rooms;
	}

	// eslint-disable-next-line class-methods-use-this
	getRoomInfo() {
		const roomList = Object.keys(initVals.rooms);
		const info = [];
		for (let i = 0; i < roomList.length; i += 1) {
			info[i] = initVals.rooms[roomList[i]].userCount;
		}
		return info;
	}
}
