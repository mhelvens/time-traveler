export function assert(a) {
	function extractExpression(fn) {
		console.log(fn.toString());
		let match = fn.toString().match(/function\s*\(.*?\)\s*\{\s*return\s*(.*?)\s*?;\s*\}/);
		if (!match) { match = fn.toString().match(/function\s*\(.*?\)\s*\{\s*(.*?)\s*\}/) }
		if (!match) { return null }
		return match[1];
	}
	let result;
	try {
		result = a();
	} catch (e) {
		throw new Error(`Error while evaluating assertion "${extractExpression(a)}"!\n${event}`);
	}
	if (!result) {
		throw new Error(`Assertion "${extractExpression(a)}" failed!`);
	}
}

export function last(A) {
	return A[A.length-1];
}

export function isDefined(v) {
	return typeof v !== 'undefined';
}

export function chainIsDefined(obj, key0, ...otherKeys) {
	if (!isDefined(key0)) { return true }
	if (obj instanceof Map) {
		return obj.has(key0) && chainIsDefined(obj.get(key0), ...otherKeys);
	} else {
		return !!(key0 in obj) && chainIsDefined(obj[key0], ...otherKeys);
	}
}

export function defOr(...vals) {
	for (let val of vals) {
		if (typeof val !== 'undefined') {
			return val;
		}
	}
}

export function abstractMethod(cls, mth) {
	throw new Error(`${cls} subclasses needs to implement '${mth}'`);
}

export function randomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function range(from, to) {
	let result = [];
	for (let i = from; i < to; ++i) { result.push(i) }
	return result;
}

export function directedVision([x0, y0], [x1, y1], cb) {
	/* Bresenham line algorithm */
	let dx = Math.abs(x1-x0);
	let dy = Math.abs(y1-y0);
	let sx = (x0 < x1) ? 1 : -1;
	let sy = (y0 < y1) ? 1 : -1;
	let err = dx-dy;
	while(true){
		let passThrough = cb(x0, y0);
		if (!passThrough)       { break }
		if (x0===x1 && y0===y1) { break }
		let e2 = 2*err;
		if (e2 >-dy){ err -= dy; x0  += sx; }
		if (e2 < dx){ err += dx; y0  += sy; }
	}
}

export const sw = (val) => (map) => ( (val in map) ? map[val] : map.default );
