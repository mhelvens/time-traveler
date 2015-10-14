import $    from 'jquery';
import riot from 'riot';

import {chainIsDefined, range}     from './util.es6.js';
import {unknown, nothing, terrain} from './symbols.es6.js';
import {ExampleReality}            from './ExampleReality.es6.js';
import {Observer}                  from './Observer.es6.js';
import Player                      from './Player.es6.js';
import Frame                       from './Frame.es6.js';
import Time                        from './Time.es6.js';

const FRAME_WIDTH  = 21;
const FRAME_HEIGHT = 21;

riot.tag('world-map', `

    <div class="info">
        <span><b>world:  </b>t   = {frame.t.time}</span>
        <span><b>player: </b>age = {player.age}  </span>
    </div>
    <table>
        <tr each="{ row in rows }">
            <td each="{ col in parent.cols }" style="background-color: black">
                <div class="tile-square" style="opacity: { tileOpacity(row, col) }">
	                <div class="tile-square" style="background: url({ terrainImg(row, col) })"></div>
	                <div class="tile-square center-content" style="background: url({ occupantImg(row, col) })" if="{ occupantImg(row, col) }">
	                    <span class="age-indicator">{ occupantAge(row, col) }</span>
	                </div>
                </div>
            </td>
        </tr>
    </table>

`, `

    .world-map {
        display: inline-block;
    }
    div.info {
        margin: 4px 0px;
    }
    div.info > span {
        display: inline-block;
        padding: 2px 4px;
        border: solid 1px gray;
    }
    table {
        border: solid 1px black;
        border-spacing: 0;
    }
    td, .tile-square {
        width:      32px;
        height:     32px;
        max-width:  32px;
        max-height: 32px;
        overflow: hidden;
        margin:  0;
        padding: 0;
        text-align: center;
    }
    td {
        position: relative;
    }
    div.tile-square {
        position: absolute;
        top:  0;
        left: 0;
    }
    div.center-content {
        display: flex;
        align-items: flex-end;
        justify-content: right;
    }
    span.age-indicator {
        font-weight: bold;
        color: white;
        background-color: black;
        padding: 0 2px;
    }

`, `

	class="world-map"

`, function (opts) {

    /* the reality provider */
    let reality = new ExampleReality();

	/* the observer of this reality coinciding with the player */
	let observer = new Observer(reality);

	/* time-point 0 */
	let t0 = new Time();

	/* the player */
	this.player = new Player({
		reality,
		observer,
		t: t0,
		x: 0,
		y: 0,
		d: 'right'
	});

    /* the frame: a viewing window on spacetime as observed by the player */
    this.frame = new Frame({
	    width:    FRAME_WIDTH,
	    height:   FRAME_HEIGHT,
        observer: observer,
        t: t0
    });
    const centerAround = ({x, y}) => {
	    this.frame.left = x - Math.floor(FRAME_WIDTH  / 2);
        this.frame.top  = y - Math.floor(FRAME_HEIGHT / 2);
    };
    centerAround(this.player);

	/* a function to set the frame's time (show alternating branches for paradox) */
	const setFrameTime = (() => {
		let tBranches;
		let tBranchIndex;
		let tBranchTimer;
		return (t) => {
			this.frame.t = t;
			tBranches    = observer.branchesOf(t);
			tBranchIndex = tBranches.indexOf(t);
			clearInterval(tBranchTimer);
			tBranchTimer = setInterval(() => {
				tBranchIndex = (tBranchIndex + 1) % tBranches.length;
				this.frame.t = tBranches[tBranchIndex];
				this.update();
			}, 200);
		}
	})();

    /* move the player (and time) with the arrow keys */
    $(document).keydown((event) => {
		/* send input to player */
		let inputUsed = this.player.receiveInput(event);

		/* if the input was not used, exit; otherwise, hijack the event and continue */
		if (!inputUsed) { return                 }
		else            { event.preventDefault() }

		/* get player successor */
		this.player = this.player.successor();

		// TODO: process other dynamic entities (e.g., quantum clones of the player)

		/* set the time(s) of the frame */
		setFrameTime(this.player.t);

		/* center the frame around the player */
		centerAround(this.player);

		/* update the visualization */
		this.update();
    });

    /* definitions to use in the HTML template */
	this.rows = range(0, FRAME_HEIGHT);
	this.cols = range(0, FRAME_WIDTH);
	this.tile = (row, col) => observer.tile(this.frame.t, this.frame.getX(col), this.frame.getY(row));
    this.terrainImg = (row, col) => {
	    let tile = this.tile(row, col);
		let known = tile.getKnown('terrain');
		let guess = tile.getGuess('terrain');
	    for (let src of [known, guess]) {
		    switch (src) {
			    case terrain.floor: return (known === guess) ? require('./img/floor-lit.png') : require('./img/floor.png');
			    case terrain.wall:  return require('./img/wall.png');
		    }
	    }
	    if (guess === unknown) { return null }
    };
    this.occupantImg = (row, col) => {
	    let tile = this.tile(row, col);
		let known = tile.getKnown('occupant');
	    // we do not indicate any 'guess' of occupancy in the absence of knowledge
	    if (known instanceof Player) { return require('./img/archaeologist.png') }
    };
	this.occupantAge = (row, col) => {
		let tile = this.tile(row, col);
		let known = tile.getKnown('occupant');
		if (known instanceof Player) { return known.age }
	};
    this.tileOpacity = (row, col) => {
	    let tile = this.tile(row, col);
		let known = tile.getKnown('terrain');
		let guess = tile.getGuess('terrain');
		if (known === unknown && guess !== unknown) { return 0.5 }
		else /*                                  */ { return 1   }
    };

});
