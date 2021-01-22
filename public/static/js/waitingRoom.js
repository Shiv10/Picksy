/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import { socketURL } from "./config.js";

$(document).ready(() => {
	const room = document.getElementById("room");
	const roomVal = room.innerHTML;
	const socket = io(`${socketURL}/waitSpace`, { query: `userRoom=${roomVal}` });
	let count = 0;
	$("button").click((e) => {
		if (count > 0) return;
		socket.emit("start", roomVal);
		count += 1;
	});
	socket.on("redirect", () => {
		window.location.replace(`/game?room=${roomVal}`);
	});
});
