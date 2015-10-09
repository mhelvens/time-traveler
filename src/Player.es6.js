import {unknown, nothing, terrain} from './symbols.es6.js';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Bresenham line algorithm */
function line(x0, y0, x1, y1, cb){
	let dx = Math.abs(x1-x0);
	let dy = Math.abs(y1-y0);
	let sx = (x0 < x1) ? 1 : -1;
	let sy = (y0 < y1) ? 1 : -1;
	let err = dx-dy;

	while(true){
		let passThrough = cb(x0, y0);
		if (!passThrough)       { break }
		if (x0===x1 && y0===y1) { break }
		let e2 = 2*err;
		if (e2 >-dy){ err -= dy; x0  += sx; }
		if (e2 < dx){ err += dx; y0  += sy; }
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const flashlight = [
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
function withinFlashlight(row, col) {
	return flashlight[row] && flashlight[row][col];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

	successor(t, x, y) {
		this.spacetime.observe(t, x, y);
		if (this.spacetime.getKnown(this.t, x, y, 'terrain') === terrain.wall) { x = y = undefined }

		return new Player({
			spacetime: this.spacetime,
			age: this.age + 1,
			t: (typeof t === 'undefined') ? this.t + 1 : t,
			x: (typeof x === 'undefined') ? this.x     : x,
			y: (typeof y === 'undefined') ? this.y     : y
		});
	}

	tryToLookAt(x, y) {
		line(this.x, this.y, x, y, (x, y) => {
			let row = y - this.y + flashlight.top;
			let col = x - this.x + flashlight.left;
			if (!withinFlashlight(row, col)) { return false }
			if (x === this.x && y === this.y) { return true }
			this.spacetime.observe(this.t, x, y, 'terrain');
			this.spacetime.observe(this.t, x, y, 'occupant');
			return this.spacetime.getKnown(this.t, x, y, 'terrain') !== terrain.wall;
		});
	}

	putInSpaceTime() {
		/* place this player in reality */
		this.spacetime.setReality(this.t, this.x, this.y, 'occupant', this);

		/* the player observes itself */
		this.spacetime.observe(this.t, this.x, this.y, 'occupant');
		this.spacetime.observe(this.t, this.x, this.y, 'terrain');

		/* the player observes itself and bunch of tiles illuminated by his flashlight */
		for (let row = 0; row < flashlight.length; ++row) {
			for (let col = 0; col < flashlight[row].length; ++col) {
				//if (flashlight[row] && flashlight[row][col]) {


					this.tryToLookAt(this.x+col-flashlight.left, this.y + row - flashlight.top);

					//line(this.x, this.y, , , (x, y) => {
					//	this.spacetime.observe(this.t, x, y, 'terrain');
					//	this.spacetime.observe(this.t, x, y, 'occupant');
					//	if (x === this.x && y === this.y) { return true }
					//	return this.spacetime.getKnown(this.t, x, y, 'terrain') !== terrain.wall;
					//});




					//let pos = [this.t, this.x + col - flashlight.left, this.y + row - flashlight.top];
					//this.spacetime.observe(...pos, 'terrain');
					//this.spacetime.observe(...pos, 'occupant');
				//}
			}
		}

		///* the player observes itself and bunch of tiles illuminated by his flashlight */
		//for (let row = 0; row < flashlight.length; ++row) {
		//	for (let col = 0; col < flashlight[row].length; ++col) {
		//		if (flashlight[row] && flashlight[row][col]) {
		//			let pos = [this.t, this.x + col - flashlight.left, this.y + row - flashlight.top];
		//			this.spacetime.observe(...pos, 'terrain');
		//			this.spacetime.observe(...pos, 'occupant');
		//		}
		//	}
		//}

	}

}
