import $    from 'jquery';
import riot from 'riot';

import {chainIsDefined, range} from './util.es6.js';
import Nothing                 from './things/Nothing.es6.js';
import Wall                    from './things/Wall.es6.js';
import Floor                   from './things/Floor.es6.js';
import {ExampleReality}        from './ExampleReality.es6.js';
import {Observer}              from './Observer.es6.js';
import Player                  from './things/Player.es6.js';
import Frame                   from './Frame.es6.js';
import Time                    from './Time.es6.js';
import {
	BACKSPACE,
	LEFT,
	UP,
	RIGHT,
	DOWN
} from './keyboard-codes.es6.js';
import {
	frameSize,
	centerOnPlayer,
	showGrid
} from './config.es6.js';

riot.tag('world-map', `

    <div class="info">
        <span><b>world:  </b>{frame.t.time}</span>
        <span><b>player: </b>{player.age}  </span>
    </div>
    <table>
        <tr each="{ row in rows }">
            <td each="{ col in cols }" style="background-color: black">
                <div class="tile-square" style="opacity: { tileOpacity(row, col) }">
	                <div class="tile-square" style="background: url({ terrainImg(row, col) })"></div>
	                <div class="tile-square center-content" style="background: url({ occupantImg(row, col) })" if="{ occupantImg(row, col) }">
	                    <span class="age-indicator">{ occupantAge(row, col) }</span>
	                </div>
                </div>
            </td>
        </tr>
    </table>
    <div class="info">
        <span>
		    <kbd class="left  { active: leftDown  }" onmousedown="{ leftMouseDown  }" onmouseup="{ leftMouseUp  }"> ◀ </kbd>
		    <kbd class="up    { active: upDown    }" onmousedown="{ upMouseDown    }" onmouseup="{ upMouseUp    }"> ▲ </kbd>
		    <kbd class="down  { active: downDown  }" onmousedown="{ downMouseDown  }" onmouseup="{ downMouseUp  }"> ▼ </kbd>
		    <kbd class="right { active: rightDown }" onmousedown="{ rightMouseDown }" onmouseup="{ rightMouseUp }"> ▶ </kbd><br />
		    walk
	    </span>
        <span>
	        <kbd class="backspace  { active: backspaceDown  }" onmousedown="{ backspaceMouseDown }" onmouseup="{ backspaceMouseUp }"> ← </kbd>
	        <input class="time-travel-distance" type="number"
	               value="{ player.controller.timeTravelDistance }"
	               onchange="{ updateTimeTravelDistance }" /><br />
		    time-travel
	    </span>
    </div>

`, `

	* {
	    box-sizing: content-box;
    }

	kbd {
		border: solid 1px gray;
		border-radius: 3px;
		display: inline-block;
		height:      20px;
		min-height:  20px;
		max-height:  20px;
		width:       20px;
		min-width:   20px;
		max-width:   20px;
		font-size:   16px;
		line-height: 16px;
		padding: 2px;
		text-align: center;
		cursor: pointer;
		background-color: white;
	    -webkit-touch-callout: none;
	    -webkit-user-select: none;
	    -khtml-user-select: none;
	    -moz-user-select: none;
	    -ms-user-select: none;
	    user-select: none;
	    position: relative;
	}
	kbd.backspace {
		width:     60px;
		min-width: 60px;
		max-width: 60px;
	}
	kbd.active {
		background-color: lightblue;
	}
	input.time-travel-distance {
		border: solid 1px gray;
		border-radius: 3px;
		height:     20px;
		min-height: 20px;
		max-height: 20px;
		width:      40px;
		min-width:  40px;
		max-width:  40px;
		padding: 2px;
		position: relative;
		top: 1px;
		margin-top: -1px;
	}

    .world-map {
        display: inline-block;
    }
    div.info {
        display: inline-block;
        margin: 4px 0px;
        text-align: center;
    }
    div.info > span {
        display: inline-block;
        padding: 4px;
        border: solid 1px gray;
        background-color: #eee;
    }
    table {
        border-spacing: 0;
        border-width: 1px;
        border-color: lightgray;
        border-style: ${showGrid ? 'none solid solid none' : 'none'};
    }
    td {
        border-width: 1px;
        border-color: lightgray;
        border-style: ${showGrid ? 'solid none none solid' : 'none'};
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
		controller: new Player.KeyboardController(),
		reality,
		observer,
		age: 0,
		t:   t0,
		x:   0,
		y:   0,
		dir: 'right'
	});

    /* the frame: a viewing window on spacetime as observed by the player */
    this.frame = new Frame({
	    width:    frameSize[0],
	    height:   frameSize[1],
        observer: observer,
        t:        t0
    });
	this.frame.anchorXY(this.player.x, this.player.y);

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


	this.updateTimeTravelDistance = (e) => {
		//console.log(e);
		this.player.controller.timeTravelDistance = e.target.value;
	};


    /* move the player (and time) with the arrow keys */
    $(document).keydown((event) => {

	    /* provide input to player controller */ // TODO: provide input to all dynamic entities
	    let inputUsed = this.player.controller.acceptInput(event);

	    /* react based on whether the input was used */
	    if (inputUsed) { event.preventDefault() }
	    else           { return                 }

		/* get player successor */
		this.player = this.player.successor();

		// TODO: process other dynamic entities (e.g., quantum clones of the player)

		/* set the time(s) of the frame */
		setFrameTime(this.player.t);

		/* center the frame around the player */
	    if (centerOnPlayer) { this.frame.anchorXY(this.player.x, this.player.y) }

		/* update the visualization */
		this.update();
    });

	[   ['left',      LEFT     ],
		['up',        UP       ],
		['down',      DOWN     ],
		['right',     RIGHT    ],
		['backspace', BACKSPACE]
	].forEach(([name, code]) => {
		this[`${name}Down`] = false;
		$(document).keydown(({which}) => { if (which === code) { this[`${name}Down`] = true;  this.update() } });
		$(document).keyup  (({which}) => { if (which === code) { this[`${name}Down`] = false; this.update() } });
		this[`${name}MouseDown`] = () => {
			var press = $.Event("keydown");
			press.which = code;
			$(document).trigger(press);
		};
		this[`${name}MouseUp`] = () => {
			var press = $.Event("keyup");
			press.which = code;
			$(document).trigger(press);
		};
	});

    /* definitions to use in the HTML template */
	this.rows = range(0, frameSize[1]);
	this.cols = range(0, frameSize[0]);
    this.terrainImg = (row, col) => {
	    let tile = this.frame.tile(row, col);
		let known = tile.getKnown('terrain');
		let guess = tile.getGuess('terrain');
	    for (let src of [known, guess]) {
		    if (src instanceof Floor) return (known === guess) ? require('./img/floor-lit.png') : require('./img/floor.png');
		    if (src instanceof Wall)  return require('./img/wall.png');
	    }
	    if (!guess) { return null }
    };
    this.occupantImg = (row, col) => {
		let known = this.frame.tile(row, col).getKnown('occupant');
	    // we do not indicate any 'guess' of occupancy in the absence of knowledge
	    if (known instanceof Player) { return require('./img/archaeologist.png') }
    };
	this.occupantAge = (row, col) => {
		let known = this.frame.tile(row, col).getKnown('occupant');
		if (known instanceof Player) { return known.age }
	};
    this.tileOpacity = (row, col) => {
	    let tile = this.frame.tile(row, col);
	    let observed = this.player.observable(tile.t, tile.x, tile.y, 'terrain');
		let known = tile.getKnown('terrain');
		let guess = tile.getGuess('terrain');
	    /**/ if (observed) { return 1    }
		else if (known   ) { return 0.75 }
		else if (guess   ) { return 0.5  }
	    else               { return 0    }
    };

});
