import $ from 'jquery';

import {chainIsDefined}            from './util.es6.js';
import {unknown, nothing, terrain} from './symbols.es6.js';
import MySpaceTime                 from './MySpaceTime.es6.js';
import Player                      from './Player.es6.js';
import Frame                       from './Frame.es6.js';


<world-map>


    <div class="info">
        <span>                     <b>world:  </b>t   = {frame.t}   </span>
        <span style="float: right"><b>player: </b>age = {player.age}</span>
    </div>
    <table>
        <tr each="{ rowA, row in frame.getKnownAsMatrix(['terrain', 'occupant']) }">
            <td each="{ tile, col in rowA }" >
                <div class="tile-square" style="background: url({ terrainImg (tile) })"></div>
                <div class="tile-square center-content" style="background: url({ occupantImg(tile) })" if="{ occupantImg(tile) }">
                    <span class="age-indicator">{ tile.occupant.age }</span>
                </div>
            </td>
        </tr>
    </table>


    <style scoped>
        :scope {
            display: inline-block;
        }
        div.info {
            margin: 2px;
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
    </style>


    <script>

        /* the full space-time */
        let spacetime = new MySpaceTime();

        /* the player */
        this.player = new Player({ spacetime });

        /* the frame: a viewing window on spacetime */
        this.frame = new Frame({
            spacetime,
            t:       0,
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
            let {t, x, y} = this.player;
            t += 1;
            switch(event.which) {
                case 8:  t -= 4; break; // back in time by 3 units
                case 37: x -= 1; break; // left
                case 38: y -= 1; break; // up
                case 39: x += 1; break; // right
                case 40: y += 1; break; // down
                default: return; // exit this handler for other keys
            }
            event.preventDefault(); // prevent the default action (scroll / move caret)

            /* get player successor and increment timers */
            this.player = this.player.successor({ t, x, y });
            this.frame.t = this.player.t;

            /* center the frame around the player */
            centerAround(this.player);

            /* update the visualization */
            this.update();
        });

        /* functions to use in the HTML template */
        this.terrainImg = (tile) => {
            switch (tile.terrain) {
                case terrain.floor: return require('./img/floor.png');
                case terrain.wall:  return require('./img/wall.png');
                case unknown:       return require('./img/unknown.png');
            }
        };
        this.occupantImg = (tile) => {
            if (tile.occupant instanceof Player) { return require('./img/archeologist.png') }
            return null;
        };

    </script>


</world-map>
