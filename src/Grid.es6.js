import GridMap from './GridMap.es6.js';

const _e        = Symbol('_e');
const _grid     = Symbol('_grid');

//
// an easy way to specify a map-grid laid out in ascii
//
export default class Grid extends GridMap {

	constructor(ascii, map = {}) {
		super();
		map = Object.assign({ ' ': null }, map);
		this[_e] = map[' '];
		this[_grid] = [[]];
		let row = 0, col = 0;
		for (let c of ascii) {
			if (c === '\n') {
				row += 1;
				col = -1;
				this[_grid].push([]);
			} else {
				if (c === '@') {
					this.anchorRowCol(row, col);
				}
				this[_grid][row].push(map[c] || null);
			}
			col += 1;
		}
	}

	get(x, y) {
		let [row, col] = this.toRowCol(x, y);
		return (this[_grid][row] && typeof this[_grid][row][col] !== 'undefined')
			? this[_grid][row][col]
			: this[_e];
	}

	forEach(cb) {
		for (let row = 0; row < this[_grid].length; ++row) {
			for (let col = 0; col < this[_grid][row].length; ++col) {
				let [x, y] = this.toXY(row, col);
				cb(x, y, this.get(x, y));
			}
		}
		return this;
	}

}
