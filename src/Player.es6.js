import {unknown, nothing, terrain} from './symbols.es6.js';
import Grid                        from './Grid.es6.js';

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

const fieldOfVision = new Grid(`

     ..
    ....
   .....
  ......
 .......
........
.@......
........
 .......
  ......
   .....
    ....
     ..

`, {
	direction: 'right',
	anchor: '@',
	'.': true,
	'@': true,
	' ': false
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default class Player {

	constructor({spacetime, age, t, x, y, d, ai}) {
		Object.assign(this, {
			spacetime,
			age: age || 0,
			t:   t   || spacetime[0],
			x:   x   || 0,
			y:   y   || 0,
			d:   d   || 'right',
			ai:  ai  || false
		});
		this.putInSpaceTime();
	}

	successor(t, x, y, d) {
		this.spacetime.observe(t, x, y, 'terrain');
		if (this.spacetime.getKnown(this.t, x, y, 'terrain') === terrain.wall) { x = y = undefined }
		return new Player({
			spacetime: this.spacetime,
			age: this.age + 1,
			t: (typeof t === 'undefined') ? this.t.plus(1) : t,
			x: (typeof x === 'undefined') ? this.x         : x,
			y: (typeof y === 'undefined') ? this.y         : y,
			d: (typeof d === 'undefined') ? this.d         : d
		});
	}

	runAI() {
		let d = ['up', 'right', 'down', 'left'][Math.floor(Math.random() * 4)];
		this.successor(
			this.t.plus(1),
			this.x + (d === 'left' ? -1 : d === 'right' ? 1 : 0),
			this.y + (d === 'down' ? -1 : d === 'up'    ? 1 : 0),
			d
		);
	}

	lookToward(x, y) {
		fieldOfVision.anchorXY(this.x, this.y);
		line(this.x, this.y, x, y, (ix, iy) => {
			if (!fieldOfVision.get(ix, iy))     { return false }
			if (ix === this.x && iy === this.y) { return true  }
			this.spacetime.observe(this.t, ix, iy, 'terrain' );
			this.spacetime.observe(this.t, ix, iy, 'occupant');
			return (this.spacetime.getKnown(this.t, ix, iy, 'terrain') !== terrain.wall); // TODO: generalize to 'tile does not obscure vision'
		});
	}

	putInSpaceTime() {
		/* place this player in reality */
		this.spacetime.setReality(this.t, this.x, this.y, 'occupant', this);

		/* the player observes its own square */
		this.t = this.spacetime.observe(this.t, this.x, this.y, 'occupant');
		this.spacetime.observe(this.t, this.x, this.y, 'terrain');

		/* the player observes a bunch of squares inside his field of vision */
		fieldOfVision.anchorXY(this.x, this.y).anchorD(this.d).forEach((x, y) => {
			this.lookToward(x, y);
		});
	}

}
