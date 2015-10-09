//
// an easy way to specify a map-grid laid out in ascii
//
export default class Grid extends Array {

	constructor(ascii, map = {}) {
		super();
		this._x = 0;
		this._y = 0;
		map = Object.assign({
			'█': 1,
			' ': 0,
			'@': 0
		}, map);
		this.push([]);
		let row = 0, col = 0;
		for (let c of ascii) {
			if (c === '\n') {
				row += 1;
				col = -1;
				this.push([]);
			} else {
				if (c === '@') {
					this.top  = row;
					this.left = col;
				}
				this[row].push(map[c]);
			}
			col += 1;
		}
	}

	get(x, y) {
		let row = y - this._y + this.top;
		let col = x - this._x + this.left;
		return this[row] && this[row][col];
	}

	anchor(x, y) {
		this._x = x;
		this._y = y;
		return this;
	}

	forEach(cb) {
		for (let row = 0; row < this.length; ++row) {
			for (let col = 0; col < this[row].length; ++col) {
				let x = this._x + col - this.left;
				let y = this._y + row - this.top;
				cb(x, y, this.get(x, y));
			}
		}
		return this;
	}

}
