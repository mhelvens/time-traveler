import {chainIsDefined}            from './util.es6.js';
import {unknown, nothing, terrain} from './symbols.es6.js';
import Grid                        from './Grid.es6.js';
import DeepMap                     from './DeepMap.es6.js';
import {Reality}                   from './Reality.es6.js';


let initialMap = new Grid(`

       #####         #####         #####
#####         #####         #####         #####
  #                                         #
  #                    @                    #
  #                                         #
#####         #####         #####         #####
       #####         #####         #####

`, {
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
	}

	getReality(t, x, y, a) {
		if (this[_incursions].has(t, x, y, a)) {
			return this[_incursions].get(t, x, y, a);
		} else { // standard map-layout with no occupants
			switch (a) {
				case 'occupant': { return nothing }
				case 'terrain': {
					return initialMap.get(x, y) ? terrain.wall : terrain.floor;
				}
			}
		}
	}

}
