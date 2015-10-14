export const unknown = Symbol('unknown');
export const nothing = Symbol('nothing');
export const terrain = {
	floor: Symbol('terrain: floor'),
	wall : Symbol('terrain: wall' )
};

// TODO: make theses (singleton) instances of some 'Thing' subclass,
//     : so that they can store their own sprite, etc.
//     : the Player would also be a 'Thing' subclass
