let flashlight = [
	[0, 0, 0, 0, 0, 1, 1, 0],
	[0, 0, 0, 0, 1, 1, 1, 1],
	[0, 0, 0, 1, 1, 1, 1, 1],
	[0, 0, 1, 1, 1, 1, 1, 1],
	[0, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[0, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 1, 1, 0]
];
flashlight.top  = 6; // anchor
flashlight.left = 1; //

export default class Player {

	constructor({spacetime, age, t, x, y}) {
		Object.assign(this, {
			spacetime,
			age: age || 0,
			t:   t   || 0,
			x:   x   || 0,
			y:   y   || 0
		});
		this.putInSpaceTime();
	}

	successor({t, x, y}) {
		return new Player({
			spacetime: this.spacetime,
			age: this.age + 1,
			t: (typeof t === 'undefined') ? this.t + 1 : t,
			x: (typeof x === 'undefined') ? this.x     : x,
			y: (typeof y === 'undefined') ? this.y + 1 : y
		});
	}

	putInSpaceTime() {
		/* place this player in reality */
		this.spacetime.setReality(this.t, this.x, this.y, 'occupant', this);

		///* the player observes itself */
		//this.spacetime.observe(this.t, this.x, this.y, 'occupant');

		/* the player observes itself and a number of tiles in front of it */
		for (let row = 0; row < flashlight.length; ++row) {
			for (let col = 0; col < flashlight[row].length; ++col) {
				if (flashlight[row] && flashlight[row][col]) {
					let pos = [this.t, this.x + col - flashlight.left, this.y + row - flashlight.top];
					this.spacetime.observe(...pos, 'terrain');
					this.spacetime.observe(...pos, 'occupant');
				}
			}
		}

	}

}
