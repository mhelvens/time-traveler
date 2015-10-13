import $    from 'jquery';
import riot from 'riot';

import {chainIsDefined}            from './util.es6.js';
import {unknown, nothing, terrain} from './symbols.es6.js';
import {MySpaceTime, Paradox}      from './MySpaceTime.es6.js';
import Player                      from './Player.es6.js';
import Frame                       from './Frame.es6.js';


riot.tag('world-map', `

    <div class="info">
        <span><b>world:  </b>t   = {frame.t.time}</span>
        <span><b>player: </b>age = {player.age}  </span>
    </div>
    <table>
        <tr each="{ rowA, row in frame.getKnownAsMatrix(['terrain', 'occupant']) }">
            <td each="{ tile, col in rowA }" style="background-color: black">
                <div class="tile-square" style="opacity: { tileOpacity(row, col) }">
	                <div class="tile-square" style="background: url({ terrainImg(row, col) })"></div>
	                <div class="tile-square center-content" style="background: url({ occupantImg(row, col) })" if="{ occupantImg(row, col) }">
	                    <span class="age-indicator">{ tile.occupant.age }</span>
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

    /* the full space-time */
    let spacetime = new MySpaceTime();

	/* alternating branches, to show paradox */
	let tBranches;
	let tBranchIndex;
	let tBranchTimer;
	const setFrameTime = (t) => {
		this.frame.t = t;
		tBranches    = spacetime.branchesOf(t);
		tBranchIndex = tBranches.indexOf(t);
		clearInterval(tBranchTimer);
		tBranchTimer = setInterval(() => {
			tBranchIndex = (tBranchIndex + 1) % tBranches.length;
			this.frame.t = tBranches[tBranchIndex];
			this.update();
		}, 1000);
	};


    /* the player */
    this.player = new Player({ spacetime });

    /* the frame: a viewing window on spacetime */
    this.frame = new Frame({
        spacetime,
        t:      spacetime[0],
        width:  21,
        height: 21
    });
    const centerAround = ({x, y}) => {
        this.frame.top  = y - 10;
        this.frame.left = x - 10;
    };
    centerAround(this.player);

    /* move the player (and time) with the arrow keys */
    $(document).keydown((event) => {
        let {t, x, y, d} = this.player;
        let newT;
        switch(event.which) {
	        case 8:  newT = t.minus(3);     break; // back in time by 3 units
            case 37: x   -= 1; d = 'left';  break;
            case 38: y   -= 1; d = 'up';    break;
            case 39: x   += 1; d = 'right'; break;
            case 40: y   += 1; d = 'down';  break;
            default: return; // exit this handler for other keys
        }
	    event.preventDefault();             // for recognized keys, prevent default browser behavior
	    d = event.shiftKey ? undefined : d; // when holding shift key, do not turn the player around
	    if (!newT) { newT = t.plus(1) }     // by default, move forward in time by 1 step

        /* get player successor */
        this.player = this.player.successor(newT, x, y, d);

	    /* set times */
	    setFrameTime(newT);

        /* center the frame around the player */
        centerAround(this.player);

        /* update the visualization */
        this.update();
    });

    /* functions to use in the HTML template */
    this.terrainImg = (row, col) => {
		let coords = [this.frame.t, this.frame.getX(col), this.frame.getY(row)];
		let known = spacetime.getKnown(...coords, 'terrain');
		let guess = spacetime.getGuess(...coords, 'terrain');
	    for (let src of [known, guess]) {
		    switch (src) {
			    case terrain.floor: return (known === guess) ? require('./img/floor-lit.png') : require('./img/floor.png');
			    case terrain.wall:  return require('./img/wall.png');
		    }
	    }
	    if (guess === unknown) { return null }
    };
    this.occupantImg = (row, col) => {
		let coords = [this.frame.t, this.frame.getX(col), this.frame.getY(row)];
		let known = spacetime.getKnown(...coords, 'occupant');
	    if (known instanceof Player) { return require('./img/archaeologist.png') }
    };
    this.tileOpacity = (row, col) => {
		let coords = [this.frame.t, this.frame.getX(col), this.frame.getY(row)];
		let known = spacetime.getKnown(...coords, 'terrain');
		let guess = spacetime.getGuess(...coords, 'terrain');
		if (known === unknown && guess !== unknown) { return 0.5 }
		else /*                                  */ { return 1   }
    };

});
