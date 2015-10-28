import {rotateFromTo} from './directionality.es6';

const _aX   = Symbol('_aX');
const _aY   = Symbol('_aY');
const _aRow = Symbol('_aRow');
const _aCol = Symbol('_aCol');
const _aDir = Symbol('_aDir');


//
// an anchored row/column based representation of an x/y coordinate system
//
export default class GridMap {

	constructor() {
		this[_aX]   = 0;
		this[_aY]   = 0;
		this[_aRow] = 0;
		this[_aCol] = 0;
		this[_aDir] = 'right';
	}

	toXY(row, col, dir) {
		let [x, y] = rotateFromTo(
			col - this[_aCol],
			row - this[_aRow],
			this[_aDir],
			dir || this[_aDir]
		);
		return [
			x + this[_aX],
			y + this[_aY]
		];
	}

	toRowCol(x, y, dir) {
		let [_x, _y] = rotateFromTo(
			x - this[_aX],
			y - this[_aY],
			dir || this[_aDir],
			this[_aDir]
		);
		return [
			(_y + this[_aRow]),
			(_x + this[_aCol])
		];
	}

	anchorDir(dir) {
		if (typeof dir === 'undefined') {
			return this[_aDir];
		} else {
			this[_aDir] = dir;
			return this;
		}
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
		if (typeof row === 'undefined') {
			return [this[_aRow], this[_aCol]];
		} else {
			this[_aRow] = row;
			this[_aCol] = col;
			return this;
		}
	}

}
