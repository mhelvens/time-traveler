import {unknown, nothing, terrain}       from './symbols.es6.js';
import Grid                              from './Grid.es6.js';
import DeepMap                           from './DeepMap.es6.js';
import {randomElement, defOr, isDefined} from './util.es6.js';
import {Observer}                        from './Observer.es6.js';
import Time                              from './Time.es6.js';

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

const _successorData = Symbol('_successorData');
const _observables   = Symbol('_observables');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default class Player {

	reality; // TODO: rename to 'actor'
	observer;
	age;
	t;
	x;
	y;
	d;
	ai;

	constructor({reality, observer, age, t, x, y, d, ai}) {
		Object.assign(this, {
			reality,
			observer,
			age: age || 0,
			t:   t   || new Time(),
			x:   x   || 0,
			y:   y   || 0,
			d:   d   || 'right',
			ai:  ai  || false,
			[_observables]: new DeepMap({ depth: 4, defaultValue: unknown })
		});
		this.putInSpaceTime();
	}

	receiveInput(event) {
		let {t, x, y, d} = this;
		let newT;
		switch(event.which) {
			case 8:  newT = t.minus(3);   break; // back in time by 3 units
			case 37: x -= 1; d = 'left';  break;
			case 38: y -= 1; d = 'up';    break;
			case 39: x += 1; d = 'right'; break;
			case 40: y += 1; d = 'down';  break;
			default: return false; // exit this handler for other keys
		}
		d = event.shiftKey ? undefined : d; // when holding shift key, do not turn the player around
		if (!newT) { newT = t.plus(1) }     // by default, move forward in time by 1 step

		/* store this data to be used in a successor */
		this[_successorData] = { t: newT, x, y, d };

		/* indicate that the input was used */
		return true;
	}

	successor(ai) {
		let t, x, y, d;
		if (this[_successorData]) {
			({t, x, y, d} = this[_successorData]);
		} else if (this.ai) {
			d = randomElement(['up', 'right', 'down', 'left']);
			t = this.t.plus(1);
			x = this.x + (d === 'left' ? -1 : d === 'right' ? 1 : 0);
			y = this.y + (d === 'down' ? -1 : d === 'up'    ? 1 : 0);
		} else {
			t = this.t.plus(1);
			x = this.x;
			y = this.y;
			d = this.d;
		}
		this.observer.observe(t, x, y, 'terrain');
		if (this.observer.getKnown(this.t, x, y, 'terrain') === terrain.wall) {
			x = this.x;
			y = this.y;
		}
		return new Player({
			reality:  this.reality,
			observer: this.observer,
			age:      this.age + 1,
			ai:       defOr(ai, this.ai),
			t, x, y, d
		});
	}

	observable(...coords) {
		return this[_observables].get(...coords);
	}

	putInSpaceTime() {
		let thisxy = [this.x, this.y];
		let coords = () => [this.t, ...thisxy];

		/* place this player in reality */
		this.reality.setReality(...coords(), 'occupant', this);

		/* the player observes its own square */
		// note that this may change this.t, if the player finds himself in another time-branch
		this.t = this.observer.observe(...coords(), 'occupant');
		/*    */ this.observer.observe(...coords(), 'terrain' );
		this[_observables].set(...coords(), 'occupant', this.observer.getKnown(...coords(), 'occupant'));
		this[_observables].set(...coords(), 'terrain',  this.observer.getKnown(...coords(), 'terrain' ));

		/* the player observes a bunch of squares inside his field of vision */
		fieldOfVision.anchorXY(...thisxy).anchorD(this.d).forEach((x, y) => {
			line(...thisxy, x, y, (ix, iy) => {
				if (!fieldOfVision.get(ix, iy))     { return false }
				if (ix === this.x && iy === this.y) { return true  }
				let coords = [this.t, ix, iy];
				this.observer.observe(...coords, 'terrain' );
				this.observer.observe(...coords, 'occupant');
				this[_observables].set(...coords, 'terrain',  this.observer.getKnown(...coords, 'terrain' ));
				this[_observables].set(...coords, 'occupant', this.observer.getKnown(...coords, 'occupant'));
				return (this.observer.getKnown(...coords, 'terrain') !== terrain.wall);
				// TODO: ^ generalize to 'tile does not obscure vision'
			});
		});
	}

}
