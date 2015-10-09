//
// an easy way to specify a map-grid laid out in ascii
//
const _x        = Symbol('_x');
const _y        = Symbol('_y');
const _e        = Symbol('_e');
const _grid     = Symbol('_grid');
const _toXY     = Symbol('_toXY');
const _toRowCol = Symbol('_toRowCol');
export default class Grid {

	constructor(ascii, map = {}) {
		map = Object.assign({ ' ': null }, map);
		this[_e] = map[' '];
		this[_grid] = [[]];
		this[_x] = 0;
		this[_y] = 0;
		let row = 0, col = 0;
		for (let c of ascii) {
			if (c === '\n') {
				row += 1;
				col = -1;
				this[_grid].push([]);
			} else {
				if (c === '@') {
					this.top  = row;
					this.left = col;
				}
				this[_grid][row].push(map[c] || null);
			}
			col += 1;
		}
	}

	[_toXY](row, col) { return [ this[_x] + col - this.left, this[_y] + row - this.top ] }
	[_toRowCol](x, y) { return [ y - this[_y] + this.top,    x - this[_x] + this.left  ] }

	get(x, y) {
		let [row, col] = this[_toRowCol](x, y);
		return (this[_grid][row] && typeof this[_grid][row][col] !== 'undefined')
			? this[_grid][row][col]
			: this[_e];
	}

	anchor(x, y) {
		if (typeof x === 'undefined') {
			return [this[_x], this[_y]];
		} else {
			this[_x] = x;
			this[_y] = y;
			return this;
		}
	}

	forEach(cb) {
		for (let row = 0; row < this[_grid].length; ++row) {
			for (let col = 0; col < this[_grid][row].length; ++col) {
				let [x, y] = this[_toXY](row, col);
				cb(x, y, this.get(x, y));
			}
		}
		return this;
	}

}
