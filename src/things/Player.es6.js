import $ from 'jquery';

import Grid         from '../Grid.es6.js';
import DeepMap      from '../DeepMap.es6.js';
import {Observer}   from '../Observer.es6.js';
import Time         from '../Time.es6.js';
import {flashlight} from '../config.es6.js';
import Thing        from './Thing.es6.js';
import unknown      from './unknown.es6.js';
import Nothing      from './Nothing.es6.js';
import Wall         from './Wall.es6.js';
import Floor        from './Floor.es6.js';
import {
	BACKSPACE,
	LEFT,
	UP,
	RIGHT,
	DOWN
} from '../keyboard-codes.es6.js';
import {
	randomElement,
	defOr,
	isDefined,
	directedVision,
	sw
} from '../util.es6.js';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const fieldOfVision = new Grid(flashlight, {
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

export default class Player extends Thing {

	controller;
	reality;
	observer;
	age;
	t;
	x;
	y;
	dir;

	constructor(options) {
		super(options);
		Object.assign(this, {
			controller: options.controller,
			reality:    options.reality,
			observer:   options.observer,
			age:        options.age || 0,
			t:          options.t   || new Time(),
			x:          options.x   || 0,
			y:          options.y   || 0,
			dir:        options.dir || 'right',
			[_observables]: new DeepMap({ depth: 4, defaultValue: unknown })
		});
		this.putInSpaceTime();
	}

	successor({controller: nextController} = {}) {
		let {t, x, y, dir, controller} = this.controller.apply(this, { nextController });
		this.observer.observe(t, x, y, 'terrain');
		if (this.observer.getKnown(this.t, x, y, 'terrain') instanceof Wall) {
			// TODO: generalize to 'stop for blocking square' rather than 'block for wall'
			({x, y} = this);
		}
		return new Player({
			reality:  this.reality,
			observer: this.observer,
			age:      this.age + 1,
			controller,
			t, x, y, dir
		});
	}

	observable(...coords) {
		return this[_observables].get(...coords);
	}

	putInSpaceTime() {
		let thisXY = [this.x, this.y];
		let coords = () => [this.t, ...thisXY];

		/* place this player in reality */
		this.reality.setReality(...coords(), 'occupant', this);

		/* the player observes its own square */
		// note that `this.t` may change if the player finds himself in another time-branch
		this.t = this.observer.observe(...coords(), 'occupant');
		/*    */ this.observer.observe(...coords(), 'terrain' );
		this[_observables].set(...coords(), 'occupant', this.observer.getKnown(...coords(), 'occupant'));
		this[_observables].set(...coords(), 'terrain',  this.observer.getKnown(...coords(), 'terrain' ));

		/* the player observes a bunch of squares inside his field of vision */
		fieldOfVision.anchorXY(...thisXY).forEach(this.dir, (...xy) => {
			directedVision(thisXY, xy, (ix, iy) => {
				if (!fieldOfVision.get(ix, iy, this.dir)) { return false }
				if (ix === this.x && iy === this.y)       { return true  }
				let subjectCoords = [this.t, ix, iy];
				this.observer.observe(...subjectCoords, 'terrain' );
				this.observer.observe(...subjectCoords, 'occupant');
				this[_observables].set(...subjectCoords, 'terrain',  this.observer.getKnown(...subjectCoords, 'terrain' ));
				this[_observables].set(...subjectCoords, 'occupant', this.observer.getKnown(...subjectCoords, 'occupant'));
				return !(this.observer.getKnown(...subjectCoords, 'terrain') instanceof Wall);
				// TODO: ^ generalize to 'tile does not obscure vision' (rather than 'tile is a wall')
			});
		});
	}

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Player.KeyboardController = class KeyboardController {

	dt; dx; dy; dir;

	acceptInput(event) {
		if (![BACKSPACE, LEFT, UP, RIGHT, DOWN].includes(event.which)) { return false }
		this.dt = sw(event.which)({
			[BACKSPACE]: -2,
			default:     +1
		});
		[this.dir, this.dx, this.dy] = sw(event.which)({
			[LEFT]:  ['left' , -1,  0],
			[RIGHT]: ['right', +1,  0],
			[UP]:    ['up'   ,  0, -1],
			[DOWN]:  ['down' ,  0, +1],
			default: [       ,  0,  0]
		});
		if (event.shiftKey) { this.dir = undefined  }
		if (event.ctrlKey)  { this.dx = this.dy = 0 }
		return true;
	}

	apply(prev, { nextController = new Player.KeyboardController() } = {}) {
		return {
			t:          prev.t.plus(this.dt),
			x:          prev.x    + this.dx,
			y:          prev.y    + this.dy,
			dir:        this.dir || prev.dir,
			controller: nextController
		};
	}

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Player.RandomController = class RandomController {

	dt; dx; dy; dir;

	constructor() {
		this.dir = randomElement(['up', 'right', 'down', 'left']);
		this.dt  = +1;
		this.dx  = sw(this.dir, {'left': -1, 'right': +1}, 0);
		this.dy  = sw(this.dir, {'up':   -1, 'down':  +1}, 0);
	}

	apply(prev, { nextController = new Player.RandomController() } = {}) {
		return {
			t:          prev.t.plus(this.dt),
			x:          prev.x    + this.dx,
			y:          prev.y    + this.dy,
			dir:        this.dir || prev.dir,
			controller: nextController
		};
	}

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
