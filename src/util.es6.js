function extractExpression(fn) {
	console.log(fn.toString());
	let match = fn.toString().match(/function\s*\(.*?\)\s*\{\s*return\s*(.*?)\s*?;\s*\}/);
	if (!match) { match = fn.toString().match(/function\s*\(.*?\)\s*\{\s*(.*?)\s*\}/) }
	if (!match) { return null }
	return match[1];
}

export function assert(a) {
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

export function chainIsDefined(obj, key0, ...otherKeys) {
	if (typeof key0 === 'undefined') { return true }
	return !!(key0 in obj) && chainIsDefined(obj[key0], ...otherKeys);
}

export function defOr(...vals) {
	for (let val of vals) {
		if (typeof val !== 'undefined') {
			return val;
		}
	}
}
