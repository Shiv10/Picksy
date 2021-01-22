/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { socketURL } from "./config.js";

$(document).ready(() => {
	const socket = io(`${socketURL}/room-data`);
	socket.on("info", (data) => {
		for (let i = 0; i < data.roomList.length; i += 1) {
			console.log(`${data.roomList[i]}: ${data.playersInRooms[i]}`);
		}
	});
	let count = 0;
	$("button").click((e) => {
		if (count > 0) return;
		const t = e.target.id;
		console.log(t);
		window.location.replace(`/gameLobby?room=${t}`);
		count += 1;
	});
});
