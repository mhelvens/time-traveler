export const deg0   = [[ 1,  0], [ 0,  1]];
export const deg90  = [[ 0, -1], [ 1,  0]];
export const deg180 = [[-1,  0], [ 0, -1]];
export const deg270 = [[ 0,  1], [-1,  0]];
export const rotationFromTo = {
	right: { right: deg0, up:    deg90, left:  deg180, down:  deg270 },
	up:    { up:    deg0, left:  deg90, down:  deg180, right: deg270 },
	left:  { left:  deg0, down:  deg90, right: deg180, up:    deg270 },
	down:  { down:  deg0, right: deg90, up:    deg180, left:  deg270 }
};
export const rotateFromTo = (x, y, from, to) => {
	let r = rotationFromTo[from][to];
	return [
		r[0][0] * x + r[1][0] * y,
		r[0][1] * x + r[1][1] * y
	];
};
