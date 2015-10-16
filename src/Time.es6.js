import {last} from './util.es6';

export default class Time {
	constructor({predecessor, successor, branch} = {}) {
		if (predecessor) {
			if (predecessor.successors.length > 0 && !branch) {
				return last(predecessor.successors);
			}
			this.predecessor = predecessor;
			this.successors  = [];
			predecessor.successors.push(this);
			this.time = predecessor.time + 1;
		} else if (successor) {
			if (successor.predecessor) {
				return successor.predecessor;
			}
			successor.predecessor = this;
			this.successors = [successor];
			this.time = successor.time - 1;
		} else {
			this.successors = [];
			this.time = 0;
		}
	}
	branch()     { return new Time({ predecessor: this.predecessor, branch: true }) }
	get next()   { return new Time({ predecessor: this }) }
	get prev()   { return new Time({ successor:   this }) }
	plus(dt) {
		/**/ if (dt  <  0) { return this.minus(-dt)        }
		else if (dt === 0) { return this                   }
		else /*         */ { return this.next.plus(dt - 1) }
	}
	minus(dt) {
		/**/ if (dt  <  0) { return this.plus(-dt)          }
		else if (dt === 0) { return this                    }
		else /*         */ { return this.prev.minus(dt - 1) }
	}
}
