/* eslint-disable class-methods-use-this */
import * as stringSimilarity from "string-similarity";

import { logger } from "../tools/loggers";
import constants from "../tools/constants";
import * as initVals from "./initFill";

export default class gamePlay {
	constructor(options) {
		this.socket = options.socket;
		// this.players = initVals.players;
		// initVals.rooms = initVals.rooms;
		// this.words = initVals.words;
	}

	initGame(data) {
		initVals.players[this.socket.id] = data.room;
		initVals.rooms[data.room].users[this.socket.id] = data.name;
		initVals.rooms[data.room].keys = Object.values(initVals.rooms[data.room].users);
		initVals.rooms[data.room].userCount += 1;
		initVals.rooms[data.room].points[data.name] = 0;
	}

	selectDrawer(io, room) {
		// 1. Selects drawer
		// 2. Generates random words
		// 3. Emits event to drawer with the random word and round number.
		logger.info(room);
		if (!initVals.rooms[room].turn.start) return;

		initVals.rooms[room].currentDrawer = Object.values(initVals.rooms[room].users)[initVals.rooms[room].turnNumber];
		const userIds = Object.keys(initVals.rooms[room].users);

		for (let i = 0; i < initVals.rooms[room].userCount; i += 1) {
			if (initVals.rooms[room].users[userIds[i]] === initVals.rooms[room].currentDrawer) {
				initVals.rooms[room].currentDrawerId = userIds[i];
				break;
			}
		}

		const shuffledWords = initVals.words
			.map((x) => ({ x, r: Math.random() }))
			.sort((a, b) => a.r - b.r)
			.map((a) => a.x)
			.slice(0, constants.wordSelOptions);

		io.to(initVals.rooms[room].currentDrawerId).emit("word-selection", {
			w1: shuffledWords[0],
			w2: shuffledWords[1],
			w3: shuffledWords[2],
			round: initVals.rooms[room].roundNumber,
		});
		initVals.rooms[room].turn.start = false;
		logger.info(initVals.rooms[room].currentDrawer);
		logger.info("Drawer selected");
	}

	roundChange(io, room) {
		// 1. Changer round, shifts to next round.
		// 2. Cleares canvas

		io.to(initVals.rooms[room].currentDrawerId).emit("turn-end");
		io.to(room).emit("canvas-cleared");
		io.to(room).emit("round-end");
		logger.info("Round end!");
		initVals.rooms[room].roundNumber += 1;
		if (initVals.rooms[room].roundNumber < constants.roundNum) {
			initVals.rooms[room].turnNumber = 0;
			initVals.rooms[room].turn.start = true;
			initVals.rooms[room].turnOn = true;
			this.selectDrawer(io, room);
		}
	}

	turnChange(io, room) {
		// 1. Mover the turn to the next client
		// 2. When all clients have had turns, then round is changed.

		logger.info("turn over!");
		initVals.rooms[room].currentWord = "";
		initVals.rooms[room].usersGuessedName = [];
		initVals.rooms[room].points[initVals.rooms[room].currentDrawer]
			+= Math.floor(initVals.rooms[room].turn.timeTotal / (initVals.rooms[room].userCount - 1))
			* constants.drawerPointFactor;
		initVals.rooms[room].turn.timeTotal = 0;
		initVals.rooms[room].usersGuessed = 0;
		if (!initVals.rooms[room].cleared) {
			clearInterval(initVals.rooms[room].wordRevealInterval);
			initVals.rooms[room].cleared = true;
			initVals.rooms[room].cache.indexes = [];
			initVals.rooms[room].cache.letters = [];
		}
		io.to(room).emit("update-scoreboard", initVals.rooms[room].points);
		initVals.rooms[room].turnNumber += 1;
		if (initVals.rooms[room].turnNumber === initVals.rooms[room].userCount) {
			this.roundChange(io, room);
			initVals.rooms[room].turnOn = false;
		} else {
			io.to(initVals.rooms[room].currentDrawerId).emit("turn-end");
			io.to(room).emit("canvas-cleared");
			initVals.rooms[room].turn.start = true;
			this.selectDrawer(io, room);
		}
	}

	previousDrawing(io, name, currentRoom) {
		// 1. Pushes the revealed letters to the newly connected client

		let drawId = "";
		logger.info(currentRoom);
		const userIds = Object.keys(initVals.rooms[currentRoom].users);
		for (let i = 0; i < initVals.rooms[currentRoom].userCount; i += 1) {
			if (initVals.rooms[currentRoom].users[userIds[i]] === name) {
				drawId = userIds[i];
				break;
			}
		}

		io.to(drawId).emit("revealed", {
			letters: initVals.rooms[currentRoom].cache.letters,
			indexes: initVals.rooms[currentRoom].cache.indexes,
		});
	}

	drawerDisconnected(io, timeout, room) {
		io.to(room).emit("next-turn");

		initVals.rooms[room].turnNumber -= 1;
		clearTimeout(initVals.rooms[room].timeout);
		logger.info("turn over!");
		initVals.rooms[room].usersGuessedName = [];
		initVals.rooms[room].cache.indexes = [];
		initVals.rooms[room].cache.letters = [];
		initVals.rooms[room].turnNumber += 1;
		initVals.rooms[room].points[initVals.rooms[room].currentDrawer]
			+= Math.floor(initVals.rooms[room].turn.timeTotal / (initVals.rooms[room].userCount - 1))
			* constants.drawerPointFactor;
		initVals.rooms[room].turn.timeTotal = 0;
		if (!initVals.rooms[room].cleared) {
			clearInterval(initVals.rooms[room].wordRevealInterval);
			initVals.rooms[room].cleared = true;
			initVals.rooms[room].cache.indexes = [];
			initVals.rooms[room].cache.letters = [];
		}
		io.to(room).emit("update-scoreboard", initVals.rooms[room].points);
		if (initVals.rooms[room].turnNumber === initVals.rooms[room].userCount) {
			this.roundChangeOnDisconnect(io, room);
			initVals.rooms[room].turnOn = false;
		} else {
			io.to(room).emit("canvas-cleared");
			initVals.rooms[room].turn.start = true;
			this.selectDrawer(io, room);
		}
	}

	roundChangeOnDisconnect(io, room) {
		io.to(room).emit("canvas-cleared");
		io.to(room).emit("round-end");
		logger.info(`Round end for ${room}`);
		initVals.rooms[room].roundNumber += 1;
		if (initVals.rooms[room].roundNumber < constants.roundNum) {
			initVals.rooms[room].turnNumber = 0;
			initVals.rooms[room].turn.start = true;
			initVals.rooms[room].turnOn = true;
			this.selectDrawer(io, room);
		}
	}

	calculatePoints(t, room) {
		const time = 80 - (t - initVals.rooms[room].turn.timeStart);
		const p = time * constants.playerPointFactor;
		initVals.rooms[room].turn.timeTotal += time;
		return p;
	}

	checkSimilarity(text, room) {
		const similarity = stringSimilarity.compareTwoStrings(initVals.rooms[room].currentWord, text);
		return similarity;
	}

	revealLetter(io, room) {
		let letter = "";
		let letterIndex;
		let loop = true;
		while (loop) {
			letterIndex = Math.floor(Math.random() * (initVals.rooms[room].currentWord.length - 1 - 0));
			// logger.info(letterIndex);
			if (initVals.rooms[room].cache.indexes.indexOf(letterIndex) === -1) {
				initVals.rooms[room].cache.indexes.push(letterIndex);
				loop = false;
				break;
			}
		}

		letter = initVals.rooms[room].currentWord.charAt(letterIndex);
		initVals.rooms[room].cache.letters.push(letter);
		io.to(room).emit("letter", { letter, index: letterIndex });
	}

	resetRoom(room) {
		initVals.rooms[room].userCount -= 1;
		initVals.rooms[room].roundNumber = 0;
		initVals.rooms[room].turn.start = false;
		initVals.rooms[room].turn.timeStart = 0.0;
		initVals.rooms[room].turn.timeTotal = 0;
		initVals.rooms[room].currentWord = "";
		initVals.rooms[room].currentDrawer = "";
		initVals.rooms[room].currentDrawerId = "";
		initVals.rooms[room].points = {};
		initVals.rooms[room].usersGuessed = 0;
		initVals.rooms[room].usersGuessedName = [];
		initVals.rooms[room].turnNumber = 0;
		initVals.rooms[room].startCount = 0;
		initVals.rooms[room].turnOn = false;
		clearInterval(initVals.rooms[room].wordRevealInterval);
		initVals.rooms[room].wordRevealInterval = null;
		clearTimeout(initVals.rooms[room].timeout);
		initVals.rooms[room].timeout = null;
		initVals.rooms[room].cleared = false;
		initVals.rooms[room].usersGuessedName = [];
		initVals.rooms[room].cache.indexes = [];
		initVals.rooms[room].cache.letters = [];
		initVals.rooms[room].keys = [];
		if (initVals.rooms[room].userCount === 0) {
			initVals.rooms[room].users = {};
		}
	}
}
