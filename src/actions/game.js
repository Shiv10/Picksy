// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------
// This is under Development, do not use this file for production purposes
// ---------------------------------------------------
// ---------------------------------------------------
// ---------------------------------------------------

const { logger } = require("../tools/loggers");
const constants = require("../tools/constants");

const Participant = require("../models/participant.schema");

class GAME {
	constructor(options) {
		this.io = options.io; // Check better way of getting this io file
		this.id = options.id;
		this.name = options.name;
		this.drawerStack = []; // List of users in line to be a drawer
		this.users = null; // SocketId --> name
		this.words = null;
		this.matchOpts = null; // name --> points
	}

	async init() {
		this.users = null; // Participant.findAll();
		this.getWords();
		this.initOptionsFill();
	}

	async playerJoinRoom(name) {
		this.users[this.id] = name;
		this.drawerStack.push(name);
		this.matchOpts[name] = 0;
		if (this.drawerStack.length >= 2 && this.options.gameInProgress === false) {
			this.io.emit("startNewMatch");
		}
		logger.info("user connected");
	}

	async startNewMatch() {
		this.currentRoundNumber = 0;
		this.gameInProgress = true;
		this.resetUsersPoints();
	}

	async startNewRound() {
		this.shuffleDrawerDeck();
		this.currentRoundNumber += 1;
		this.updateTurn();
	}

	async wordSelection() {
		// Return random list of 3 words
		const wordsList = this.words
			.map((x) => ({ x, r: Math.random() }))
			.sort((a, b) => a.r - b.r)
			.map((a) => a.x)
			.slice(0, constants.wordSelOptions);
		this.words = wordsList;
		this.io.to(this.drawerId).emit(wordsList);
	}

	async wordSelected(selectedWord) {
		this.currentWord = selectedWord;
		this.io.emit("matchStarted");
		const matchTimeLimit = setTimeout(this.gameEnd, constants.timeOfRound, this.io);
	}

	async matchStart() {
		const currTimeStamp = Date.now();
		this.io.emit(`matchStarted, ${currTimeStamp}`);
	}

	async userGuessed(guessedWord) {
		if (guessedWord === this.currentWord) {
			this.io.emit(`${this.name} has guessed the word`);
		}
	}

	initOptionsFill() {
		this.options = {
			currentRoundNumber: 0,
			gameInProgress: false,
			turn: {
				start: false,
				timeStart: 0.0,
				timeTotal: 0,
			},
			currentWord: "",
			currentDrawer: "",
			currentDrawerId: "",
			points: {},
			usersGuessed: 0,
			drawCache: {
				canvasX: [],
				canvasY: [],
				indexes: [],
				letters: [],
			},
		};
	}

	getWords() {
		this.words = null; // Words.findAll();
	}

	updateTurn() {
		const newDrawer = this.drawerStack.pop();
		if (newDrawer !== "undefined") {
			this.currentDrawer = newDrawer;
		} else {
			this.endRound();
		}
	}

	resetUsersPoints() {
		Object.keys(this.matchOpts).forEach((name) => {
			this.matchOpts[name] = 0;
		});
	}
}
