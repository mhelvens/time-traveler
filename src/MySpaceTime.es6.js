import {chainIsDefined}            from './util.es6.js';
import {unknown, nothing, terrain} from './symbols.es6.js';
import SpaceTime                   from './SpaceTime.es6.js'
import Grid                        from './Grid.es6.js';

let initialMap = new Grid(`

       █████         █████         █████
█████         █████         █████         █████
  █                                         █
  █                    @                    █
  █                                         █
█████         █████         █████         █████
       █████         █████         █████

`);

export default class MySpaceTime extends SpaceTime {

	constructor(options) {
		super(options);
		this._incursions = {};
	}

	setReality(t, x, y, a, val) {
		if (!this._incursions[t])          { this._incursions[t]          = {}  }
		if (!this._incursions[t][x])       { this._incursions[t][x]       = {}  }
		if (!this._incursions[t][x][y])    { this._incursions[t][x][y]    = {}  }
		if (!this._incursions[t][x][y][a]) {
			this._incursions[t][x][y][a] = val;
		}
	}

	getReality(t, x, y, a) {
		if (chainIsDefined(this._incursions, t, x, y, a)) {
			return this._incursions[t][x][y][a];
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
