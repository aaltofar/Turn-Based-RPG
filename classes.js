class Sprite {
	constructor({
		position,
		velocity,
		image,
		frames = { max: 1, hold: 20 },
		sprites,
		animate = false,
		isEnemy = false,
		rotation = 0,
	}) {
		this.position = position;
		this.image = image;
		this.frames = { ...frames, val: 0, elapsed: 0 };

		this.image.onload = () => {
			this.width = this.image.width / this.frames.max;
			this.height = this.image.height;
		};
		this.animate = animate;
		this.sprites = sprites;
		this.opacity = 1;
		this.health = 100;
		this.isEnemy = isEnemy;
		this.rotation = rotation;
	}
	draw() {
		c.save();
		c.translate(
			this.position.x + this.width / 2,
			this.position.y + this.height / 2
		);
		c.rotate(this.rotation);
		c.translate(
			-this.position.x + this.width / 2,
			-this.position.y + this.height / 2
		);
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
		const tl = gsap.timeline();
		this.health -= attack.damage;
		let movementDistance = 20;
		if (this.isEnemy) movementDistance = -20;
		let healthBar = "#enemyHealthBar";
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
								width: this.health + "%",
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
				tl.to(this.position, {
					x: this.position.x - movementDistance,
				})
					.to(this.position, {
						x: this.position.x + movementDistance * 2,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: this.health + "%",
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
			case "Limitless":
				tl.to(this.position, {
					x: this.position.x - movementDistance,
				})
					.to(this.position, {
						x: this.position.x + movementDistance * 2,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: this.health + "%",
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
			case "Crimson Moon":
				tl.to(this.position, {
					x: this.position.x - movementDistance,
				})
					.to(this.position, {
						x: this.position.x + movementDistance * 2,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: this.health + "%",
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
			case "Tackle":
				tl.to(this.position, {
					x: this.position.x - movementDistance,
				})
					.to(this.position, {
						x: this.position.x + movementDistance * 2,
						duration: 0.1,
						onComplete: () => {
							gsap.to(healthBar, {
								width: this.health + "%",
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
