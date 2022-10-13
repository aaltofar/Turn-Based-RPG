// #region [ defaultFarge ] canvasSetup //
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 576;
// #endregion //
document.querySelector("#battleUiContainer").style.display = "none";

// #region [ variabler ]  Hjelpevariabler og variabler for diverse spillogikk //
let battleAnimationId;
let animationId;
let queue = [];
const battleIntroAudio = new Audio("./audio/BattleIntro.mp3");
const overworldAudio = new Audio("./audio/overworldMusic.mp3");
const falconPunchAudio = new Audio("./audio/falconPunchAudio.mp3");
const LimitlessAudio = new Audio("./audio/limitlessAudio.mp3");
const kamehamehaAudio = new Audio("./audio/kamehamehaAudio.mp3");
const crimsonMoonAudio = new Audio("./audio/crimsonMoonAudio.mp3");
const interactiontiles = [];
const boundaries = [];
const offset = {
	x: 0,
	y: -50,
};
// #endregion //
//lager kollisjonsblokker
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
	collisionsMap.push(collisions.slice(i, 70 + i));
}
//lager interaksjonsblokker
const interactionsMap = [];
for (let i = 0; i < interactions.length; i += 70) {
	interactionsMap.push(interactions.slice(i, 70 + i));
}
// #region [ kilder ] hjelpevariabler for bildekilder
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

const pressFimg = new Image();
pressFimg.src = "./img/pressFimg.png";

const battleBgImg = new Image();
battleBgImg.src = "./img/battleBgOverworld.png";
// #endregion
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
		c.fillStyle = "rgba(0,255,0,0";
		c.fillRect(this.position.x, this.position.y, this.width, this.height);
	}
}

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
//denne tegner og holder egenskapene til forskjellige sprites i spillet, håndterer også angrepsanimasjoner
class Sprite {
	constructor({
		position,
		velocity,
		image,
		opacity,
		frames = { max: 1, hold: 20 },
		sprites,
		animate = false,
		isEnemy = false,
		rotation = 0,
		name,
	}) {
		this.position = position;
		this.image = new Image();
		this.frames = { ...frames, val: 0, elapsed: 0 };

		this.image.onload = () => {
			this.width = this.image.width / this.frames.max;
			this.height = this.image.height;
		};
		this.image.src = image.src;
		this.animate = animate;
		this.sprites = sprites;
		this.opacity = opacity;
		this.health = 100;
		this.isEnemy = isEnemy;
		this.rotation = rotation;
		this.name = name;
	}
	faint() {
		document.querySelector("#dialogBox").innerHTML = this.name + " fainted! ";
		gsap.to(this.position, {
			y: this.position.y + 20,
		});
		gsap.to(this, {
			opacity: 0,
			onComplete: () => {
				renderedSprites = [];
			},
		});
	}
	draw() {
		c.save();
		c.rotate(this.rotation);
		c.globalAlpha = this.opacity;
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
		c.restore();

		if (!this.animate) return;
		if (this.frames.max > 1) {
			this.frames.elapsed++;
		}

		if (this.frames.elapsed % this.frames.hold === 0) {
			if (this.frames.val < this.frames.max - 1) this.frames.val++;
			else this.frames.val = 0;
		}
	}

	attack({ attack, recipient, renderedSprites }) {
		document.querySelector("#dialogBox").style.display = "block";
		document.querySelector("#dialogBox").innerHTML =
			this.name + " used " + attack.name;
		const tl = gsap.timeline();
		recipient.health -= attack.damage;
		let movementDistance = 20;
		if (this.isEnemy) movementDistance = -20;
		let healthBar = "#enemyHealthBar";
		let crimsonMoonEnd = "#crimsonMoonAnimPic";
		let kamehamehaEnd = "#kamehamehaEndPic";
		if (this.isEnemy) healthBar = "#playerHealthBar";
		switch (attack.name) {
			case "Falcon Punch":
				const falconPunchImg = new Image();
				falconPunchImg.src = "./img/falconPunchAnim.png";
				const falconPunchAttack = new Sprite({
					position: {
						x: this.position.x + 50,
						y: this.position.y,
					},
					image: falconPunchImg,
					frames: {
						max: 6,
						hold: 15,
					},
					animate: true,
				});

				renderedSprites.splice(1, 0, falconPunchAttack);
				falconPunchAudio.play();
				tl.to(this.position, {
					x: this.position.x - movementDistance,
				})
					.to(this.position, {
						x: this.position.x + movementDistance * 2,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: recipient.health + "%",
							});
							gsap.to(falconPunchAttack.position, {
								x: recipient.position.x,
								y: recipient.position.y + 25,
							});
							gsap.to(recipient.position, {
								x: recipient.position.x + 10,
								yoyo: true,
								repeat: 5,
								duration: 0.08,
							});
							gsap.to(recipient, {
								opacity: 0,
								yoyo: true,
								repeat: 5,
								duration: 0.08,
							});
						},
					})
					.to(this.position, {
						x: this.position.x,
						onComplete: () => {
							renderedSprites.splice(1, 1);
						},
					});

				break;
			case "Ultra Big Bang Kamehameha":
				const kamehamehaImg = new Image();
				kamehamehaImg.src = "./img/kamehamehaImg.png";

				const kamehamehaAttack = new Sprite({
					position: {
						x: 0,
						y: 0,
					},
					image: kamehamehaImg,
					frames: {
						max: 12,
						hold: 20,
					},
					animate: true,
					opacity: 1,
				});
				kamehamehaAudio.play();
				tl.to(this.position, {
					y: this.position.y - 125,
					duration: 0.1,
					onComplete: () => {
						this.opacity = 0;
						enemy.opacity = 0;
						renderedSprites.splice(1, 0, kamehamehaAttack);
					},
				});
				tl.to(kamehamehaAttack, {
					delay: 2.5,
					onComplete: () => {
						gsap.to(kamehamehaEnd, {
							opacity: 1,
						});
						renderedSprites.splice(1, 1);
						gsap.to(this.position, {
							y: this.position.y + 125,
						});
					},
				});
				tl.to(kamehamehaAttack, {
					opacity: 0,
				});
				tl.to(kamehamehaEnd, {
					delay: 2,
					opacity: 0,
					onComplete: () => {
						this.opacity = 1;
						enemy.opacity = 1;
						gsap.to(healthBar, {
							width: recipient.health + "%",
						});
					},
				});
				break;
			case "Limitless":
				const limitlessImg = new Image();
				limitlessImg.src = "./img/limitlessImg.png";
				const limitlessAttack = new Sprite({
					position: {
						x: 0,
						y: 0,
					},
					image: limitlessImg,
					frames: {
						max: 11.98,
						hold: 20,
					},
					animate: true,
					opacity: 1,
				});
				const limitlessEndImg = new Image();
				limitlessEndImg.src = "./img/limitlessEndImg.png";
				const limitlessEndAttack = new Sprite({
					position: {
						x: 0,
						y: 0,
					},
					image: limitlessEndImg,
					frames: {
						max: 11.98,
						hold: 20,
					},
					animate: true,
					opacity: 1,
				});
				//limitlessAudio.play();
				tl.to(this.position, {
					y: this.position.y - 125,
					duration: 0.1,
					onComplete: () => {
						this.opacity = 0;
						enemy.opacity = 0;
						renderedSprites.splice(1, 0, limitlessAttack);
					},
				});
				tl.to(limitlessAttack, {
					delay: 2.5,
					onComplete: () => {
						renderedSprites.splice(1, 1);
						renderedSprites.splice(1, 0, limitlessEndAttack);

						gsap.to(this.position, {
							y: this.position.y + 125,
						});
					},
				});
				tl.to(limitlessAttack, {
					opacity: 0,
				});
				tl.to(limitlessEndAttack, {
					delay: 2,
					opacity: 0,
					onComplete: () => {
						renderedSprites.splice(1, 1);
						this.opacity = 1;
						enemy.opacity = 1;
						gsap.to(healthBar, {
							width: recipient.health + "%",
						});
					},
				});
				break;
			case "Crimson Moon":
				const crimsonMoonImage = new Image();
				crimsonMoonImage.src = "./img/crimsonMoonMid.png";

				const crimsoonMoonAttack = new Sprite({
					position: {
						x: 0,
						y: 0,
					},
					image: crimsonMoonImage,
					frames: {
						max: 6,
						hold: 10,
					},
					animate: true,
					opacity: 0,
				});

				renderedSprites.splice(1, 0, crimsoonMoonAttack);
				crimsonMoonAudio.play();
				tl.to(this.position, {
					x: this.position.x - 250,
				})
					.to(this.position, {
						x: recipient.position.x,
						y: recipient.position.y,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: recipient.health + "%",
							});
							gsap.to(crimsoonMoonAttack.position, {
								x: 0,
								y: 0,
							});
							gsap.to(crimsoonMoonAttack, {
								opacity: 1,
							});
							gsap.to(this, {
								opacity: 0,
							});
						},
					})
					.to(crimsoonMoonAttack, {
						opacity: 1,
					})
					.to(crimsoonMoonAttack, {
						opacity: 1,
						onComplete: () => {
							gsap.to(crimsonMoonEnd, {
								opacity: 1,
							});
							gsap.to(crimsonMoonEnd, {
								opacity: 0,
								delay: 4,
							});
							gsap.to(crimsoonMoonAttack, {
								opacity: 0,
							});
							gsap.to(this, {
								delay: 1,
								opacity: 1,
							});
							renderedSprites.splice(1, 1);
							gsap.to(this.position, {
								x: 275,
								y: 350,
							});
						},
					});

				break;
			case "Tackle":
				tl.to(this.position, {
					x: this.position.x - movementDistance,
				})
					.to(this.position, {
						x: this.position.x + movementDistance * 2,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: recipient.health + "%",
							});
							gsap.to(recipient.position, {
								x: recipient.position.x + 10,
								yoyo: true,
								repeat: 5,
								duration: 0.08,
							});
							gsap.to(recipient, {
								opacity: 0,
								yoyo: true,
								repeat: 5,
								duration: 0.08,
							});
						},
					})
					.to(this.position, {
						x: this.position.x,
					});
				break;
		}
	}
}
//du kan trykke F her
const battlePopUp = new Sprite({
	position: {
		x: offset.x + 375,
		y: offset.y + 240,
	},
	image: pressFimg,
});

const battleBackground = new Sprite({
	position: {
		x: 0,
		y: 0,
	},
	image: battleBgImg,
	opacity: 1,
});

const player = new Sprite({
	position: {
		x: canvas.width / 2 - 128 / 4 / 2,
		y: canvas.height / 2 - 32 / 2,
	},
	image: playerDownImage,
	frames: {
		max: 4,
		hold: 20,
	},
	sprites: {
		up: playerUpImage,
		down: playerDownImage,
		left: playerLeftImage,
		right: playerRightImage,
	},
});
//fienden i battle
let enemy = new Sprite({
	position: {
		x: 700,
		y: 260,
	},
	image: {
		src: "./img/bigBadEnemy.png",
	},
	frames: {
		max: 4,
		hold: 60,
	},
	name: "Old man Marius",
	animate: true,
	isEnemy: true,
	opacity: 1,
});
//spillersprite i battle
let playerBattle = new Sprite({
	position: {
		x: 275,
		y: 350,
	},
	image: {
		src: "./img/playerBattleImage.png",
	},
	frames: {
		max: 4,
		hold: 60,
	},
	name: "You",
	animate: true,
	opacity: 1,
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
	f: {
		pressed: false,
	},
};
//alt som skal bevege seg når man trykker WASD.
const movables = [background, ...boundaries, ...interactiontiles, foreground];
function rectangularCollision({ rectangle1, rectangle2 }) {
	return (
		rectangle1.position.x + player.width >= rectangle2.position.x &&
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + player.height >= rectangle2.position.y
	);
}

let battleToggle = {
	initiated: false,
};
//animasjonsfunksjonen til overworld, denne lar deg gå rundt på kartet
function animate() {
	animationId = window.requestAnimationFrame(animate);
	battleBackground.opacity = 0;
	background.draw();
	boundaries.forEach((boundary) => {
		boundary.draw();
	});
	interactiontiles.forEach((interaction) => {
		interaction.draw();
	});
	if (battleToggle.initiated) {
		window.cancelAnimationFrame(animationId);
		return;
	}
	player.draw();
	foreground.draw();
	handleAudio(battleIntroAudio, overworldAudio);
	interactTileF();
	let moving = true;
	player.animate = false;
	if (keys.w.pressed && lastKey === "w") {
		player.animate = true;
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
		player.animate = true;
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
		player.animate = true;
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
		player.animate = true;
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

startGame();
//håndterer kampstart og F tasten
function interactTileF() {
	let interactable = false;
	for (let i = 0; i < interactiontiles.length; i++) {
		const interaction = interactiontiles[i];
		if (
			rectangularCollision({
				rectangle1: player,
				rectangle2: interaction,
			})
		) {
			battlePopUp.draw();
			interactable = true;
			if (lastKey === "f") {
				lastKey = "";
				battleToggle.initiated = true;
				window.cancelAnimationFrame(animationId);

				handleAudio(battleIntroAudio, overworldAudio);
				gsap.to("#overlappingDiv", {
					opacity: 1,
					repeat: 5,
					yoyo: true,
					duration: 0.4,
					onComplete() {
						gsap.to("#overlappingDiv", {
							opacity: 1,
							duration: 0.4,
							onComplete() {
								document.querySelector("#battleUiContainer").style.display =
									"block";
								initBattle();
								animateBattle();
								gsap.to("#overlappingDiv", {
									opacity: 0,
									duration: 0.4,
								});
							},
						});
					},
				});
				return;
			}
		}
	}
}
//initierer kamp, kalles hver gang for å resette HP bars og UI
function initBattle() {
	queue = [];
	battleBackground.opacity = 1;
	document.querySelector("#battleUiContainer").style.display = "block";
	document.querySelector("#enemyHealthBar").style.width = "100%";
	document.querySelector("#playerHealthBar").style.width = "100%";
	document.querySelector("#dialogBox").style.display = "none";
	enemy = new Sprite({
		position: {
			x: 700,
			y: 260,
		},
		image: {
			src: "./img/bigBadEnemy.png",
		},
		frames: {
			max: 4,
			hold: 60,
		},
		name: "Old man Marius",
		animate: true,
		isEnemy: true,
		opacity: 1,
	});

	playerBattle = new Sprite({
		position: {
			x: 275,
			y: 350,
		},
		image: {
			src: "./img/playerBattleImage.png",
		},
		frames: {
			max: 4,
			hold: 60,
		},
		name: "You",
		animate: true,
		opacity: 1,
	});
	renderedSprites = [enemy, playerBattle];
	animateBattle();
}
//lar deg trykke på skjermen i introsekvensen for å komme videre til selve spillet
function startGame() {
	let gameStartToggle = false;
	document.querySelector("#videoOverlay").addEventListener("click", (e) => {
		gameStartToggle = true;
		if (gameStartToggle === true) {
			animate();
			e.currentTarget.style.display = "none";
			e.currentTarget.pause();
		}
	});
}
//animerer kampsekvensen
function animateBattle() {
	battleAnimationId = window.requestAnimationFrame(animateBattle);
	//window.requestAnimationFrame(animateBattle);
	battleBackground.draw();

	gsap.to(".battleUI", {
		opacity: 1,
		duration: 1,
	});
	renderedSprites.forEach((sprite) => {
		sprite.draw();
	});
}
//lar deg trykke på angrepsknappene
document.querySelectorAll("button").forEach((button) => {
	button.addEventListener("click", (e) => {
		const selectedAttack = attacks[e.currentTarget.innerHTML];
		playerBattle.attack({
			attack: selectedAttack,
			recipient: enemy,
			renderedSprites,
		});
		if (enemy.health <= 0) {
			queue.push(() => {
				enemy.faint();
			});
			queue.push(() => {
				gsap.to("#overlappingDiv", {
					opacity: 1,
					duration: 0.4,
					onComplete: () => {
						window.cancelAnimationFrame(battleAnimationId);
						battleToggle.initiated = false;
						document.querySelector("#battleUiContainer").style.display = "none";
						gsap.to("#overlappingDiv", {
							opacity: 0,
						});
						animate();
						queue = [];
					},
				});
			});
		}
		queue.push(() => {
			enemy.attack({
				attack: attacks.Tackle,
				recipient: playerBattle,
				renderedSprites,
			});
		});
	});
	//mouseover for å se typen til angrepet
	button.addEventListener("mouseenter", (e) => {
		const selectedAttack = attacks[e.currentTarget.innerHTML];
		document.querySelector("#attackTypeBox").innerHTML = selectedAttack.type;
		document.querySelector("#attackTypeBox").style.color = selectedAttack.color;
	});
});

document.querySelector("#dialogBox").addEventListener("click", (e) => {
	if (queue.length > 0) {
		queue[0]();
		queue.shift();
	} else {
		e.currentTarget.style.display = "none";
		document.querySelector("battleUiContainer").style.display = "none";
	}
});
//håndterer musikken i overworld og battle
function handleAudio(battle, overworld) {
	if (battleToggle.initiated === true) {
		overworld.pause();
		battle.currentTime = 0;
		battle.play();
	} else {
		battle.pause();
		overworld.play();
	}
}

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
		case "f":
			keys.f.pressed = true;
			lastKey = "f";
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
		case "f":
			keys.f.pressed = false;
			break;
	}
});
