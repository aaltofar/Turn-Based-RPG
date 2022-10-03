const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
	collisionsMap.push(collisions.slice(i, 70 + i));
}

const interactionsMap = [];
for (let i = 0; i < interactions.length; i += 70) {
	interactionsMap.push(interactions.slice(i, 70 + i));
}

class Boundary {
	static width = 80;
	static height = 80;
	constructor({ position }) {
		this.position = position;
		this.width = 80;
		this.height = 80;
	}

	draw() {
		c.fillStyle = "rgba(255,0,0,0";
		c.fillRect(this.position.x, this.position.y, this.width, this.height);
	}
}

class interaction {
	static width = 80;
	static height = 80;
	constructor({ position }) {
		this.position = position;
		this.width = 80;
		this.height = 80;
	}

	draw() {
		c.fillStyle = "rgba(0,255,0,1";
		c.fillRect(this.position.x, this.position.y, this.width, this.height);
	}
}

const interactiontiles = [];
const boundaries = [];
const offset = {
	x: 0,
	y: -50,
};

collisionsMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 734)
			boundaries.push(
				new Boundary({
					position: {
						x: j * Boundary.width + offset.x,
						y: i * Boundary.height + offset.y,
					},
				})
			);
	});
});

interactionsMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 939)
			interactiontiles.push(
				new interaction({
					position: {
						x: j * interaction.width + offset.x,
						y: i * interaction.height + offset.y,
					},
				})
			);
	});
});

const image = new Image();
image.src = "./img/overworld.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/overworldForeground.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/playerDown.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/playerUp.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/playerRight.png";

class Sprite {
	constructor({ position, velocity, image, frames = { max: 1 }, sprites }) {
		this.position = position;
		this.image = image;
		this.frames = { ...frames, val: 0, elapsed: 0 };

		this.image.onload = () => {
			this.width = this.image.width / this.frames.max;
			this.height = this.image.height;
		};
		this.moving = false;
		this.sprites = sprites;
	}
	draw() {
		//c.drawImage(this.image, this.position.x, this.position.y)
		c.drawImage(
			this.image,
			this.frames.val * this.width,
			0,
			this.image.width / this.frames.max,
			this.image.height,
			this.position.x,
			this.position.y,
			this.image.width / this.frames.max,
			this.image.height
		);

		if (!this.moving) return;
		if (this.frames.max > 1) {
			this.frames.elapsed++;
		}

		if (this.frames.elapsed % 20 === 0) {
			if (this.frames.val < this.frames.max - 1) this.frames.val++;
			else this.frames.val = 0;
		}
	}
}

const player = new Sprite({
	position: {
		x: canvas.width / 2 - 128 / 4 / 2,
		y: canvas.height / 2 - 32 / 2,
	},
	image: playerDownImage,
	frames: {
		max: 4,
	},
	sprites: {
		up: playerUpImage,
		down: playerDownImage,
		left: playerLeftImage,
		right: playerRightImage,
	},
});

const background = new Sprite({
	position: {
		x: offset.x,
		y: offset.y,
	},
	image: image,
});

const foreground = new Sprite({
	position: {
		x: offset.x,
		y: offset.y,
	},
	image: foregroundImage,
});

const keys = {
	w: {
		pressed: false,
	},
	a: {
		pressed: false,
	},
	s: {
		pressed: false,
	},
	d: {
		pressed: false,
	},
};

const movables = [background, ...boundaries, ...interactiontiles, foreground];
function rectangularCollision({ rectangle1, rectangle2 }) {
	return (
		rectangle1.position.x + player.width >= rectangle2.position.x &&
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + player.height >= rectangle2.position.y
	);
}

function animate() {
	window.requestAnimationFrame(animate);
	background.draw();
	boundaries.forEach((boundary) => {
		boundary.draw();
	});
	interactiontiles.forEach((interaction) => {
		interaction.draw();
	});
	player.draw();
	foreground.draw();
	let moving = true;
	player.moving = false;
	if (keys.w.pressed && lastKey === "w") {
		player.moving = true;
		player.image = player.sprites.up;
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x,
							y: boundary.position.y + 2,
						},
					},
				})
			) {
				console.log("colliding");
				moving = false;
				break;
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.y += 2;
			});
	} else if (keys.a.pressed && lastKey === "a") {
		player.moving = true;
		player.image = player.sprites.left;
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x + 2,
							y: boundary.position.y,
						},
					},
				})
			) {
				console.log("colliding");
				moving = false;
				break;
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.x += 2;
			});
	} else if (keys.s.pressed && lastKey === "s") {
		player.moving = true;
		player.image = player.sprites.down;
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x,
							y: boundary.position.y - 2,
						},
					},
				})
			) {
				console.log("colliding");
				moving = false;
				break;
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.y -= 2;
			});
	} else if (keys.d.pressed && lastKey === "d") {
		player.moving = true;
		player.image = player.sprites.right;
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (
				rectangularCollision({
					rectangle1: player,
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x - 2,
							y: boundary.position.y,
						},
					},
				})
			) {
				console.log("colliding");
				moving = false;
				break;
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.x -= 2;
			});
	}
}

animate();

let lastKey = "";
window.addEventListener("keydown", (e) => {
	switch (e.key) {
		case "w":
			keys.w.pressed = true;
			lastKey = "w";
			break;
		case "a":
			keys.a.pressed = true;
			lastKey = "a";
			break;
		case "s":
			keys.s.pressed = true;
			lastKey = "s";
			break;
		case "d":
			keys.d.pressed = true;
			lastKey = "d";
			break;
	}
});

window.addEventListener("keyup", (e) => {
	switch (e.key) {
		case "w":
			keys.w.pressed = false;
			break;
		case "a":
			keys.a.pressed = false;
			break;
		case "s":
			keys.s.pressed = false;
			break;
		case "d":
			keys.d.pressed = false;
			break;
	}
});
