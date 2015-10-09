import {rotateFromTo} from './directionality.es6';

const _aX   = Symbol('_aX');
const _aY   = Symbol('_aY');
const _aRow = Symbol('_aRow');
const _aCol = Symbol('_aCol');
const _iD   = Symbol('_iD');
const _aD   = Symbol('_aD');


//
// an anchored row/column based representation of an x/y coordinate system
//
export default class GridMap {

	toXY(row, col) {
		let [x, y] = rotateFromTo(
			col - this[_aCol],
			row - this[_aRow],
			this[_iD],
			this[_aD]
		);
		return [
			x + this[_aX],
			y + this[_aY]
		];

		//let x = col + this[_aX] - this[_aCol];
		//let y = row + this[_aY] - this[_aRow];
		//return [x, y];
	}

	toRowCol(x, y) {
		let [xx, yy] = rotateFromTo(
			x - this[_aX],
			y - this[_aY],
			this[_aD],
			this[_iD]
		);
		return [
			(yy + this[_aRow]),
			(xx + this[_aCol])
		];
	}

	constructor(initD = 'right') {
		this[_aX] = 0;
		this[_aY] = 0;
		this[_aRow] = 0;
		this[_aCol] = 0;
		this[_iD] = initD;
		this[_aD] = 'right';
	}

	anchorD(d) {
		if (typeof d === 'undefined') {
			return this[_aD];
		} else {
			this[_aD] = d;
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
