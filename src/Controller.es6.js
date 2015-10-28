import {abstractMethod} from './util.es6.js';

export default class Controller {

	acceptInput() { return false }

	apply() { abstractMethod('Controller', 'apply') }

};
