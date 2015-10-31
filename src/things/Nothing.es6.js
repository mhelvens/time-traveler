import Thing from './Thing.es6.js';

let singleton;

export default class Nothing extends Thing {
	constructor() {
		super();
		if (!singleton) { singleton = this }
		return singleton;
	}
}
