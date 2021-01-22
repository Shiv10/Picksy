/* eslint-disable import/extensions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
import { socketURL } from "./config.js";

window.addEventListener("load", () => {
	const getRoom = document.getElementById("getRoom");
	const room = getRoom.innerHTML;
	// eslint-disable-next-line no-undef
	const socket = io(`${socketURL}/gameSpace`, { query: `userRoom=${room}` });
	let name = "";

	// eslint-disable-next-line no-constant-condition

	const nameVal = document.getElementById("getName");
	name = nameVal.innerHTML;
	socket.emit("new user", { name, room });

	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	// eslint-disable-next-line no-undef

	const messageCon = document.getElementById("message-container");
	const btn = document.getElementById("send-button");
	const msg = document.getElementById("message-input");
	const undoBtn = document.getElementById("undo");
	const saveBtn = document.getElementById("save");
	let canDraw = false;
	const wordCon = document.getElementById("word-reveal");
	const fillBtn = document.getElementById("fill");
	const selectedColor = document.getElementById("colorPicker");
	let fill = false;
	let saveData;
	let undoStackDrawer = [];

	const undoLimit = 3;

	function send() {
		const timeStamp = new Date();
		const ct = Math.floor(timeStamp.getTime() / 1000);
		if (msg.value === "") return;
		socket.emit("message", { text: msg.value, time: ct, room });
		messageCon.innerHTML += `<strong>${name}</strong>: ${msg.value}<br>`;
		msg.value = "";
	}

	msg.addEventListener("keyup", (e) => {
		if (e.keyCode === 13) {
			e.preventDefault();
			btn.click();
		}
	});

	btn.addEventListener("click", send);

	socket.on("message", (data) => {
		messageCon.innerHTML += `<strong>${data.name}</strong>: ${data.text}<br>`;
	});

	socket.on("send-data", () => {
		console.log("Hey, sending data....");
		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const normalArray = Array.from(imgData.data);
		socket.emit("state", { room, state: normalArray });
	});

	socket.on("state", (data) => {
		const imgData = new ImageData(500, 500);
		imgData.data.set(data.state);
		ctx.putImageData(imgData, 0, 0);
	});

	saveBtn.addEventListener("click", () => {
		const image = canvas.toDataURL("img/png", 1.0)
			.replace("gameLobby/png", "image/octet-stream");
		const link = document.createElement("a");
		link.download = "my-drawing.png";
		link.href = image;
		link.click();
	});

	// Drawing fucntionality started

	canvas.height = 500;
	canvas.width = 500;

	let painting = false;

	function draw(e) {
		if (!painting) return;
		if (!canDraw) return;
		if (fill) return;

		ctx.strokeStyle = selectedColor.value;
		ctx.lineWidth = 5;
		ctx.lineCap = "round";
		const x = e.clientX - 17;
		const y = e.clientY - 17;
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x, y);

		socket.emit("draw", {
			x,
			y,
			color: selectedColor.value,
			room,
		});
	}

	function startPosition(e) {
		saveData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		if (undoStackDrawer.length >= undoLimit) undoStackDrawer.shift();
		undoStackDrawer.push(saveData);
		painting = true;
		draw(e);
	}

	function finishedPosition() {
		painting = false;
		ctx.beginPath();
		socket.emit("stop", { room });
	}

	socket.on("draw", (data) => {
		ctx.lineWidth = 5;
		ctx.lineCap = "round";
		ctx.strokeStyle = data.color;

		ctx.lineTo(data.x, data.y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(data.x, data.y);
	});

	socket.on("stop", () => {
		ctx.beginPath();
	});

	const clrbtn = document.getElementById("clear-canvas");
	clrbtn.addEventListener("click", clearCanvas);
	function clearCanvas() {
		if (!canDraw) return;
		socket.emit("canvas-cleared", { room });
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	socket.on("canvas-cleared", () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});

	const fillColor = (point, color) => {
		// eslint-disable-next-line no-new
		new Fill(canvas, point, color);
	};

	const checkFill = (e) => {
		if (!fill) return;
		saveData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		if (undoStackDrawer.length >= undoLimit) undoStackDrawer.shift();
		undoStackDrawer.push(saveData);
		fill = false;
		socket.emit("fill", {
			x: e.clientX - 17,
			y: e.clientY - 17,
			color: selectedColor.value,
			room,
		});
		fillColor({ x: e.clientX - 17, y: e.clientY - 17 }, selectedColor.value);
	};

	socket.on("fill", (data) => {
		fillColor({ x: data.x, y: data.y }, data.color);
	});

	const fillClick = () => {
		if (!fill) return;
		canvas.addEventListener("mousedown", checkFill);
	};

	fillBtn.addEventListener("click", () => {
		if (!canDraw) return;
		fill = true;
		fillClick();
	});

	function undoPaint() {
		if (!canDraw) return;
		if (undoStackDrawer.length > 0) {
			ctx.putImageData(undoStackDrawer[undoStackDrawer.length - 1], 0, 0);
			const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const normalArray = Array.from(imgData.data);
			socket.emit("undo", { room, state: normalArray });
			undoStackDrawer.pop();
		} else {
			alert("Nothing to Undo");
		}
	}

	undoBtn.addEventListener("click", undoPaint);
	canvas.addEventListener("mousedown", startPosition);
	canvas.addEventListener("mouseup", finishedPosition);
	canvas.addEventListener("mousemove", draw);

	// drawing functionality ends

	const wh = document.getElementById("word-holder");
	const dispName = document.getElementById("drawer");
	const selectWord = (data) => {
		console.log("selected");
		console.log("You can draw!");
		dispName.innerHTML = "Your Turn!";
		const d1 = document.getElementById("o1");
		const d2 = document.getElementById("o2");
		const d3 = document.getElementById("o3");
		const se = document.getElementById("sel");

		d1.value = data.w1;
		d2.value = data.w2;
		d3.value = data.w3;

		d1.innerHTML = data.w1;
		d2.innerHTML = data.w2;
		d3.innerHTML = data.w3;

		let selected = false;
		if (data.round === 0) {
			setTimeout(autoSelect, 10000);

			function autoSelect() {
				if (selected) return;
				selectBtn1.click();
			}

			const selectBtn1 = document.getElementById("chose1");
			selectBtn1.style.display = "inline";
			selectBtn1.addEventListener("click", () => {
				selectBtn1.style.display = "none";
				socket.emit("word-selected", { word: se.value, room });
				wh.innerHTML = `The word you selected is ${se.value}`;
				selected = true;
			});
		} else if (data.round === 1) {
			setTimeout(autoSelect, 10000);

			function autoSelect() {
				if (selected) return;
				selectBtn2.click();
			}
			const selectBtn2 = document.getElementById("chose2");
			selectBtn2.style.display = "inline";
			selectBtn2.addEventListener("click", () => {
				selectBtn2.style.display = "none";
				socket.emit("word-selected", { word: se.value, room });
				wh.innerHTML = `The word you selected is ${se.value}`;
				selected = true;
			});
		} else if (data.round === 2) {
			setTimeout(autoSelect, 10000);

			function autoSelect() {
				if (selected) return;
				selectBtn3.click();
			}
			const selectBtn3 = document.getElementById("chose3");
			selectBtn3.style.display = "inline";
			selectBtn3.addEventListener("click", () => {
				selectBtn3.style.display = "none";
				socket.emit("word-selected", { word: se.value, room });
				wh.innerHTML = `The word you selected is ${se.value}`;
				selected = true;
			});
		}
	};

	socket.on("word-selection", (data) => {
		selectWord(data);
	});

	const dispTime = document.getElementById("timer");

	socket.on("word-selected", (data) => {
		undoStackDrawer = [];
		console.log(JSON.stringify(data));
		if (name === data.name) {
			canDraw = true;
		}
		const timeStamp = new Date();
		const ct = Math.floor(timeStamp.getTime() / 1000);
		console.log(`Time of round start: ${data.time}`);
		console.log(`Current time is ${ct}`);
		dispName.innerHTML = `${data.name} is drawing!`;
		let nextTurn = false;

		socket.on("next-turn", () => {
			nextTurn = true;
		});

		// Timer funtionality
		const t = setInterval(countDown, 1000);
		let p = 81 - (ct - data.time);
		socket.on("leave", () => {
			dispTime.innerHTML = "Everyone left! What are you doing here?";
			dispName.innerHTML = "";
			wordCon.innerHTML = "";
			clearInterval(t);
			window.location.replace("/home");
		});
		function countDown() {
			p -= 1;
			dispTime.innerHTML = p;
			if (p <= 0 || nextTurn) {
				dispTime.innerHTML = "Turn Over";
				dispName.innerHTML = "";
				wordCon.innerHTML = "";
				clearInterval(t);
			}

			if (p <= 20) {
				socket.emit("no-more-reveal", { room });
			}
		}
	});

	socket.on("turn-end", () => {
		canDraw = false;
		console.log("Turn end!");
		wh.innerHTML = "";
		dispName.innerHTML = "";
	});

	socket.on("round-end", () => {
		dispTime.innerHTML = "<strong>Round has ended!</strong>";
	});

	socket.on("leave", () => {
		dispTime.innerHTML = "Everyone left! What are you doing here?";
		dispName.innerHTML = "";
		wordCon.innerHTML = "";
		window.location.replace("/home");
	});

	socket.on("word-guessed", (data) => {
		messageCon.innerHTML += `<p style = "color:green">${data.name} guessed the word!<br></p>`;
	});

	socket.on("similar-word", (data) => {
		messageCon.innerHTML += `<p style = "color:red">${data.text} is close!<br></p>`;
	});

	socket.on("start-game", () => {
		console.log("game started");
	});

	function revealLetter(data) {
		wordCon.innerHTML += `<strong>${data.letter}</strong> at index: ${data.index}<br>`;
	}

	socket.on("letter", revealLetter);

	function wordsRevealed(data) {
		for (let i = 0; i < data.letters.length; i += 1) {
			wordCon.innerHTML += `<strong>${data.letters[i]}</strong> at index: ${data.indexes[i]}<br>`;
		}
	}
	socket.on("revealed", wordsRevealed);

	function updateScoreboard(points) {
		const board = document.getElementById("scorecard");
		const keys = Object.keys(points);
		const l = keys.length;
		board.innerHTML = "";
		board.innerHTML = "<h4><strong>Scorecard</strong></h4>";
		for (let i = 0; i < l; i += 1) {
			board.innerHTML += `<p>${keys[i]}: ${points[keys[i]]}`;
		}
	}

	socket.on("update-scoreboard", updateScoreboard);
});

// CLASS FOR FILLING FUNCTINALITY!

class Fill {
	constructor(canvas, point, color) {
		this.ctx = canvas.getContext("2d");
		this.point = point;
		this.color = color;
		this.fillStackXY = [];
		this.fillStackTC = [];
		this.fillStackFC = [];
		this.imgData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		const targetColor = this.getPixel(point);
		const fcolor = this.hexToRgba(color);

		this.floodFill(point, targetColor, fcolor);
		this.fillShape();
	}

	floodFill(point, targetColor, fcolor) {
		if (this.colorsMatch(targetColor, fcolor)) return;
		const currentColor = this.getPixel(point);

		if (this.colorsMatch(currentColor, targetColor)) {
			this.setPixel(point, fcolor);
			this.fillStackXY.push([point.x - 1, point.y]); // , targetColor, fcolor);
			this.fillStackTC.push(targetColor);
			this.fillStackFC.push(fcolor);
			this.fillStackXY.push([point.x + 1, point.y]);
			this.fillStackTC.push(targetColor);
			this.fillStackFC.push(fcolor);
			this.fillStackXY.push([point.x, point.y - 1]); // targetColor, fcolor);
			this.fillStackTC.push(targetColor);
			this.fillStackFC.push(fcolor);
			this.fillStackXY.push([point.x, point.y + 1]); // , targetColor, fcolor);
			this.fillStackTC.push(targetColor);
			this.fillStackFC.push(fcolor);
		}
	}

	fillShape() {
		if (this.fillStackXY.length) {
			const range = this.fillStackXY.length;
			let point;
			for (let i = 0; i < range; i += 1) {
				point = {
					x: this.fillStackXY[i][0],
					y: this.fillStackXY[i][1],
				};
				this.floodFill(point, this.fillStackTC[i], this.fillStackFC[i]);
			}
			this.fillStackXY.splice(0, range);
			this.fillStackTC.splice(0, range);
			this.fillStackFC.splice(0, range);
			this.fillShape();
		} else {
			this.ctx.putImageData(this.imgData, 0, 0);
			this.fillStackXY = [];
			this.fillStackTC = [];
			this.fillStackFC = [];
		}
	}

	getPixel(point) {
		let arr;
		if (point.x < 0 || point.y < 0 || point.x >= this.imgData.width || point.y >= this.imgData.height) {
			arr = [-1, -1, -1, -1];
		} else {
			const offset = (point.y * this.imgData.width + point.x) * 4;
			arr = [
				this.imgData.data[offset + 0],
				this.imgData.data[offset + 1],
				this.imgData.data[offset + 2],
				this.imgData.data[offset + 3],
			];
		}
		return arr;
	}

	// eslint-disable-next-line class-methods-use-this
	hexToRgba(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255];
	}

	// eslint-disable-next-line class-methods-use-this
	colorsMatch(color1, color2) {
		return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
	}

	setPixel(point, fcolor) {
		const offset = (point.y * this.imgData.width + point.x) * 4;
		this.imgData.data[offset + 0] = fcolor[0];
		this.imgData.data[offset + 1] = fcolor[1];
		this.imgData.data[offset + 2] = fcolor[2];
		this.imgData.data[offset + 3] = fcolor[3];
	}
}
