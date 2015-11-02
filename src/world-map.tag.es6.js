import $    from 'jquery';
import riot from 'riot';
//import './keys.css';

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
	SHIFT,
	CTRL,
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

	<div class="flex-row" style="align-items: flex-start">
		<div style="border: solid 1px black">
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
	    </div>
		<div class="flex-col">
		    <div class="info flex-row"><b>world:  </b><span>{frame.t.time}</span></div>
		    <div class="info flex-row"><b>player: </b><span>{player.age}  </span></div>
		    <div class="info">
		        <b>walking</b>
			        <div class="flex-row" style="display: block; margin-top: 4px">
					    <kbd class="up    { active: upDown    }" onmousedown="{ upMouseDown    }" onmouseup="{ upMouseUp    }"> ▲ </kbd>
			        </div>
			        <div class="flex-row" style="display: block; margin-top: 4px">
					    <kbd class="left  { active: leftDown  }" onmousedown="{ leftMouseDown  }" onmouseup="{ leftMouseUp  }"> ◀ </kbd><kbd class="down  { active: downDown  }" onmousedown="{ downMouseDown  }" onmouseup="{ downMouseUp  }"> ▼ </kbd><kbd class="right { active: rightDown }" onmousedown="{ rightMouseDown }" onmouseup="{ rightMouseUp }"> ▶ </kbd>
			        </div>
		        <div style="text-align: left; margin-top: 7px; padding-left: 2px;">
			        <label class="flex-row" style="display: inline-flex; font-family: 'Liberation Serif',serif;"><input type="checkbox" __checked="{ lockDirection }" onchange="{ updateLockDirection }" />&nbsp;lock direction</label>
			        <label class="flex-row" style="display: inline-flex; font-family: 'Liberation Serif',serif;"><input type="checkbox" __checked="{ lockPosition  }" onchange="{ updateLockPosition  }" />&nbsp;lock position </label>
		        </div>
		    </div>
		    <div class="info">
		        <b>time-travel</b>
		        <div class="flex-row" style="margin-top: 4px">
			        <kbd class       = "light backspace { active: backspaceDown  }"
			             onmousedown = "{ backspaceMouseDown }"
			             onmouseup   = "{ backspaceMouseUp   }"> ← </kbd>
			        <input class="time-travel-distance" type="number"
			               value="{ player.controller.timeTravelDistance }"
			               onchange="{ updateTimeTravelDistance }" />
		        </div>
		    </div>
        </div>
	</div>


`, `

	* {
	    box-sizing: border-box;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .flex-row > *             { margin-left: 4px }
    .flex-row > *:first-child { margin-left: 0px }

    .flex-col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
    .flex-col > *             { margin-top: 4px }
    .flex-col > *:first-child { margin-top: 0px }

	kbd {
		display: inline-block;
		height:      22px;
		min-height:  22px;
		max-height:  22px;
		width:       22px;
		min-width:   22px;
		max-width:   22px;
		font-size:   16px !important;
		line-height: 16px !important;
		padding: 2px;
		text-align: center;
		cursor: pointer;

		border: none;
		text-decoration: none;
		-moz-border-radius: .3em;
		-webkit-border-radius: .3em;
		border-radius: .3em;
		-moz-user-select: none;
		-webkit-user-select: none;
		user-select: none;

		background: rgb(250, 250, 250);
		background: -moz-linear-gradient(top, rgb(210, 210, 210), rgb(255, 255, 255));
		background: -webkit-gradient(linear, left top, left bottom, from(rgb(210, 210, 210)), to(rgb(255, 255, 255)));
		color:  rgb(50, 50, 50);
		text-shadow: 0 0 2px rgb(255, 255, 255);
		-moz-box-shadow: inset 0 0 1px rgb(255, 255, 255), inset 0 0 .4em rgb(200, 200, 200), 0 .1em 0 rgb(130, 130, 130), 0 .11em 0 rgba(0, 0, 0, .4), 0 .1em .11em rgba(0, 0, 0, .9);
		-webkit-box-shadow: inset 0 0 1px rgb(255, 255, 255), inset 0 0 .4em rgb(200, 200, 200), 0 .1em 0 rgb(130, 130, 130), 0 .11em 0 rgba(0, 0, 0, .4), 0 .1em .11em rgba(0, 0, 0, .9);
		box-shadow: inset 0 0 1px rgb(255, 255, 255), inset 0 0 .4em rgb(200, 200, 200), 0 .1em 0 rgb(130, 130, 130), 0 .11em 0 rgba(0, 0, 0, .4), 0 .1em .11em rgba(0, 0, 0, .9);
	}
	kbd.backspace {
		width:     64px;
		min-width: 64px;
		max-width: 64px;
	}
	kbd.active {
		background: lightblue;
		background: -moz-linear-gradient(top, rgb(210, 210, 210), lightblue);
		background: -webkit-gradient(linear, left top, left bottom, from(rgb(210, 210, 210)), to(lightblue));
	}
	input.time-travel-distance {
		border: solid 1px gray;
		border-radius: 3px;
		height:     24px;
		min-height: 24px;
		max-height: 24px;
		width:      44px;
		min-width:  44px;
		max-width:  44px;
		padding: 0 0 0 4px;
	}

    .world-map {
        display: inline-block;
    }
    div.info {
        display: block;
        margin: 4px;
        text-align: center;
        padding: 4px;
        border: solid 1px gray;
        background-color: #eee;
        width: 124px;
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

	/* events of fields / buttons / etc. */
	this.updateTimeTravelDistance = (e) => {
		this.player.controller.timeTravelDistance = e.target.value;
	};
	this.lockPosition = false;
	this.updateLockPosition = (e) => {
		this.lockPosition = e.target.checked;
	};
	this.lockDirection = false;
	this.updateLockDirection = (e) => {
		this.lockDirection = e.target.checked;
	};
	$(document).keydown(({which}) => {
		if (which === CTRL)  { this.lockPosition  = true }
		if (which === SHIFT) { this.lockDirection = true }
		this.update();
	});
	$(document).keyup(({which}) => {
		if (which === CTRL)  { this.lockPosition  = false }
		if (which === SHIFT) { this.lockDirection = false }
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


    /* move the player (and time) with the arrow keys */
    $(document).keydown((event) => {

	    /* set locked keys */
	    if (this.lockPosition)  { event.ctrlKey  = true }
	    if (this.lockDirection) { event.shiftKey = true }

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
