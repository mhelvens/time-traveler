import {chainIsDefined} from './util.es6.js';
import Nothing          from './things/Nothing.es6.js';
import Wall             from './things/Wall.es6.js';
import Floor            from './things/Floor.es6.js';
import Grid             from './Grid.es6.js';
import DeepMap          from './DeepMap.es6.js';
import {Reality}        from './Reality.es6.js';
import {realityMap}     from './config.es6.js';

let initialMap = new Grid(realityMap, {
	anchor: '@',
	'#': true,
	' ': false,
	'@': false
});

const _incursions = Symbol('_incursions');

export class ExampleReality extends Reality {

	constructor(...args) {
		super(...args);
		this[_incursions] = new DeepMap({ depth: 4 });
	}

	setReality(t, x, y, a, val) {
		this[_incursions].set(t, x, y, a, val);
		if (val.blocking)  { this[_incursions].set(t, x, y, 'blocking',  true) }
		if (val.obscuring) { this[_incursions].set(t, x, y, 'obscuring', true) }
	}

	getReality(t, x, y, a) {
		if (this[_incursions].has(t, x, y, a)) {
			return this[_incursions].get(t, x, y, a);
		} else { // standard map-layout with no occupants
			switch (a) {
				case 'occupant':  { return new Nothing                                   }
				case 'terrain':   { return initialMap.get(x, y) ? new Wall : new Floor   }
				case 'blocking':  { return this.getReality(t, x, y, 'terrain').blocking  }
				case 'obscuring': { return this.getReality(t, x, y, 'terrain').obscuring }
			}
		}
	}

}
