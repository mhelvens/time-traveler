//
// an anchored row/column based representation of an x/y coordinate system
//
const _aX   = Symbol('_aX');
const _aY   = Symbol('_aY');
const _aRow = Symbol('_aRow');
const _aCol = Symbol('_aCol');
export default class GridMap {

	toXY(row, col) { return [ (col + this[_aX] - this[_aCol]),  (row + this[_aY] - this[_aRow]) ] }
	toRowCol(x, y) { return [ (y   - this[_aY] + this[_aRow]),  (x   - this[_aX] + this[_aCol]) ] }

	constructor() {
		this[_aX]   = 0;
		this[_aY]   = 0;
		this[_aRow] = 0;
		this[_aCol] = 0;
	}

	anchorXY(x, y) {
		if (typeof x === 'undefined') {
			return [this[_aX], this[_aY]];
		} else {
			this[_aX] = x;
			this[_aY] = y;
			return this;
		}
	}

	anchorRowCol(row, col) {
		if (typeof x === 'undefined') {
			return [this[_aRow], this[_aCol]];
		} else {
			this[_aRow] = row;
			this[_aCol] = col;
			return this;
		}
	}

}
