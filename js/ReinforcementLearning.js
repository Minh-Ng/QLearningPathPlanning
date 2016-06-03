define(['Underscore'], function () {
    var aHelper = function() {
        var that = this;

        this.setBase = function(e) {
            that.base = e;
        }

        this.eq = function(e) {
            return _.isEqual(that.base, e);
        };
    };

    //console.log('Reinforcement Learning Module Dependencies Loaded')
    var retModule = function () {
        var that = this;

        var comp = new aHelper();
        var autorunSpeed = 400;
        var pps = 110; // Pixels Per Side
        var cfg = null;
        var ctx = null;
        var imgPrev = null;
        var canvas = null;
        var reset = false;
        var uncertain = false;

        this.create = function(config) {
            cfg = config;
            this.initConfig();
            this.createGraph();
            this.drawGraph(this.width*pps, this.height*pps);
            this.drawSelf(reset);
            this.drawValues();
            this.createButtons();
        };

        this.initConfig = function() {
            this.height = cfg['map_size'][0];
            this.width = cfg['map_size'][1];
            this.start = cfg['start'];
            this.goal = cfg['goal'];
            this.walls = cfg['walls'];
            this.pits = cfg['pits'];
            this.learningRate = cfg['learning_rate'];
            this.discount = cfg['discount_factor'];
            this.stepReward = cfg['reward_for_each_step'];
            this.wallReward = cfg['reward_for_hitting_wall'];
            this.goalReward = cfg['reward_for_reaching_goal'];
            this.pitReward = cfg['reward_for_falling_in_pit'];

            this.probLeft = cfg['uncertain_prob_left'];
            this.probRight = cfg['uncertain_prob_right'];
            this.probBack = cfg['uncertain_prob_backward'];
            this.currentPos = this.start;

            var d = document.getElementById('desc');
            d.innerHTML = 'Step reward: ' + this.stepReward + ', Learning rate: ' + this.learningRate +
                          ', Discount Factor: ' + this.discount + '<br>' + 
                          d.innerHTML.replace('Pit', 'Pit, reward: ' + this.pitReward)
                                     .replace('Goal', 'Goal, reward: ' + this.goalReward)
                                     .replace('Wall', 'Wall, reward: ' + this.wallReward);
        };

        this.aRun = function() {            
            if(document.getElementById('autorun').dataset.stat == "true") {
                setTimeout(function() {
                    if(document.getElementById('autorun').dataset.stat == "true") {
                        document.getElementById('btn1').click();
                        that.aRun();
                    }
                }, autorunSpeed);
            }
        }

        // BEGIN GRAPH LOGIC
        this.createGraph = function() {
            that.qVals = [];
            that.representation = [];

            for(var i = 0; i < this.height; i++) {
                var gIntermediate = [];
                var rIntermediate = [];
                for(var j = 0; j < this.width; j++) {
                    var coord = [i, j];
                    var vals = {
                        up: 0.0, 
                        down: 0.0, 
                        left: 0.0, 
                        right: 0.0
                    };
                    var rep = 'O'
                    comp.setBase(coord);

                    if(comp.eq(this.start)) {
                        rep = 'S'
                    } else if(comp.eq(this.goal)) {
                        rep = 'G'
                    } else if(_.findIndex(this.pits, comp.eq) >= 0) {
                        rep = 'P'
                    } else if(_.findIndex(this.walls, comp.eq) >= 0) {
                        rep = 'W'
                    } 

                    gIntermediate.push(vals);
                    rIntermediate.push(rep);
                }
                that.qVals.push(gIntermediate);
                that.representation.push(rIntermediate);
            }
        };

        this.reset = function() {
            reset = false;
            this.currentPos = this.start;
        }

        function isNotWall(i) {
            var validCell = true;
            var notWall = true;

            if(i[0] < 0 || i[0] >= that.height || i[1] < 0 || i[1] >= that.width)
                validCell = false;

            comp.setBase(i);
            if(_.findIndex(that.walls, comp.eq) >= 0)
                notWall = false;

            return validCell && notWall;
        }

        function isNotPit(i) {
            var isNotPit = true;

            comp.setBase(i);
            if(_.findIndex(that.pits, comp.eq) >= 0)
                isNotPit = false;

            return isNotPit;
        }

        function isGoal(i) {
            comp.setBase(i);
            return comp.eq(that.goal);
        }

        function calculateQNew(x, y, xNext, yNext, dir) {
            var max = null;
            var coord = [yNext, xNext];
            var reward = that.stepReward;

            if(!isNotWall(coord)) {
                reward = that.wallReward;
                var vals = that.qVals[y][x];

                for(var c in vals)
                    if(!max || vals[c] > max)
                        max = vals[c];

            } else {
                var vals = that.qVals[yNext][xNext];

                for(var c in vals)
                    if(!max || vals[c] > max)
                        max = vals[c];

                if(!isNotPit(coord)) {
                    reward += that.pitReward;
                } else if(isGoal(coord)) {
                    reward += that.goalReward;
                }
            }

            if(dir == 'up') {
                that.qVals[y][x].up += that.learningRate*(reward + that.discount*max - that.qVals[y][x].up);
            } else if (dir == 'down') {
                that.qVals[y][x].down += that.learningRate*(reward + that.discount*max - that.qVals[y][x].down);
            } else if (dir == 'left') {
                that.qVals[y][x].left += that.learningRate*(reward + that.discount*max - that.qVals[y][x].left);
            } else if (dir == 'right') {
                that.qVals[y][x].right += that.learningRate*(reward + that.discount*max - that.qVals[y][x].right);
            }
        }

        // BEGIN VIEW LOGIC
        this.drawGraph = function(w, h) {
            canvas = document.getElementById('canvas');
            // Make it canvas.addEventListener to use canvas focus
            window.addEventListener('keydown', handleKeyPress, false);
            canvas.setAttribute("tabindex", "1");
            canvas.focus();

            ctx = canvas.getContext('2d');
            ctx.canvas.width = w;
            ctx.canvas.height = h;
            ctx.font = "10px Times";

            for (x = 0; x <= w; x += pps) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
                for (y = 0; y <= h; y += pps) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                    // Draw X
                    drawX(ctx, x, y);
                }
            }
            this.drawAbsorbingStates();
            imgPrev = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        };

        this.drawAbsorbingStates = function() {
            // Draw Start
            ctx.fillStyle = "rgba(5,100,200,.95)";
            drawRect(ctx, this.start[1], this.start[0]);
            // Draw X and text
            drawX(ctx, this.start[1]*pps, this.start[0]*pps);
            // Draw Goal
            ctx.fillStyle = "rgb(50,170,50)";
            drawRect(ctx, this.goal[1], this.goal[0]);
            // Draw Pits
            ctx.fillStyle = "rgb(170,50,50)";
            for(var i = 0; i < this.pits.length; i++) {
                var x = (this.pits[i]);
                drawRect(ctx, x[1], x[0]);
            }
            // Draw Walls
            ctx.fillStyle = "rgb(0,0,0)";
            for(var i = 0; i < this.walls.length; i++) {
                var x = (this.walls[i]);
                drawRect(ctx, x[1], x[0]);
            }
        };

        this.drawSelf = function(dead) {
            if(imgPrev)
                ctx.putImageData(imgPrev, 0, 0);
            // Draw current position into saved rectangle
            if(dead)
                ctx.fillStyle = "rgba(255,0,35,1)"
            else
                ctx.fillStyle = "rgba(255,187,120,.95)"
            ctx.beginPath();
            ctx.arc(this.currentPos[1]*pps + pps*.5,this.currentPos[0]*pps + pps*.5,pps/10,0,2*Math.PI);
            ctx.fill();
        };

        this.drawValues = function() {
            for(a = 0; a < this.representation.length; a++) {
                for(b = 0; b < this.representation[a].length; b++)
                    if(this.representation[a][b] == 'O' || this.representation[a][b] == 'S')
                        drawText(ctx, b, a);
            }
        };

        this.createButtons = function() {
            var d = document.createElement("div");
            var btn = document.createElement("button");        // Create a <button> element
            var btn2 = document.createElement("button");       
            var btn3 = document.createElement("button");       
            var t = document.createTextNode("Next Iteration"); // Create a text node
            var t2 = document.createTextNode("Autorun: Off");
            var t3 = document.createTextNode("Uncertainty: Off");

            d.appendChild(btn);                                // Add buttons
            d.appendChild(btn2);
            d.appendChild(btn3);                              
            btn.appendChild(t);                                // Append the text to <button>
            btn2.appendChild(t2);                              
            btn3.appendChild(t3);                              
            d.setAttribute("class", "btn-group");
            btn.setAttribute("class", "btn btn-primary btn-sm");
            btn.setAttribute("id", "btn1");
            btn2.setAttribute("class", "btn btn-primary btn-sm");
            btn2.setAttribute("id", "autorun");
            btn2.setAttribute("data-stat", "false");
            btn3.setAttribute("class", "btn btn-primary btn-sm");
            btn3.setAttribute("id", "uncertain");

            btn.onclick = function() {
                var max = null;
                var dir = null;

                var vals = that.qVals[that.currentPos[0]][that.currentPos[1]];

                for(var c in vals) {
                    if(_.isNull(max) || vals[c] > max) {
                        dir = c;
                        max = vals[c];                
                    }
                }

                var vx = 0;
                var vy = 0;

                if(dir == 'up')
                    vy = -1;
                else if(dir == 'down')
                    vy = 1;
                else if(dir == 'left')
                    vx = -1;
                else if(dir == 'right')
                    vx = 1;

                that.move(vx, vy, dir);
                canvas.focus();
            }
            btn2.onclick = function() {
                if(btn2.dataset.stat == "true") {
                    btn2.dataset.stat = "false";
                    t2.nodeValue = "Autorun: Off";
                } else if(btn2.dataset.stat == "false"){
                    btn2.dataset.stat = 'true';
                    t2.nodeValue = "Autorun: On";
                    that.aRun();
                }
            }
            btn3.onclick = function() {
                if(uncertain === true) {
                    uncertain = false;
                    t3.nodeValue = "Uncertainty: Off";
                } else if(uncertain === false){
                    uncertain = true;
                    t3.nodeValue = "Uncertainty: On";
                }
            }
            document.getElementById('center').appendChild(d);  

        };

        this.move = function(vx, vy, dir) {
            if(reset) {
                this.reset();
            } else {
                if(uncertain) {
                    var rand = _.random(0, 99); // inclusive

                    var pL = 100 * this.probLeft;
                    var pR = pL + 100 * this.probRight;
                    var pB = pR + 100 * this.probBack;

                    if(0 <= rand && rand < pL) {
                        if(dir == 'up') {
                            vx = -1;
                            vy = 0;
                        } else if(dir == 'down') {
                            vx = 1;
                            vy = 0;
                        } else if(dir == 'left') {
                            vx = 0;
                            vy = 1;  
                        } else if(dir == 'right') {
                            vx = 0;
                            vy = -1;                            
                        }
                        //console.log("Left: " + rand);
                    } else if(pL <= rand && rand < pR) {
                        if(dir == 'up') {
                            vx = 1;
                            vy = 0;
                        } else if(dir == 'down') {
                            vx = -1;
                            vy = 0;
                        } else if(dir == 'left') {
                            vx = 0;
                            vy = -1;  
                        } else if(dir == 'right') {
                            vx = 0;
                            vy = 1;                            
                        }
                        //console.log("Right: " + rand);
                    } else if(pR <= rand && rand <= pB) {
                        if(vx !== 0)
                            vx = -vx;
                        if(vy !== 0)
                            vy = -vy;
                        //console.log("Backward: " + rand);
                    }//else 
                        // Proceed forward as usual
                }
                var yN = that.currentPos[0] + vy;
                var xN = that.currentPos[1] + vx;
                var coord = [yN, xN];

                calculateQNew(that.currentPos[1], that.currentPos[0], xN, yN, dir);

                if(isGoal(coord) || !isNotPit(coord) || !isNotWall(coord)) {
                    reset = true;
                }
                if(isNotWall(coord)) {
                    that.currentPos = coord;
                }
            }
            this.drawSelf(reset);
            this.drawValues();
        }

        function drawX(context, x, y) {
            ctx.beginPath();
            context.moveTo(x,y);
            context.lineTo(x+pps,y+pps);
            context.moveTo(x+pps,y);
            context.lineTo(x,y+pps);
            context.stroke();
        }

        function drawText(context, x, y) {
            context.fillStyle = 'black';
            ctx.fillText(String(that.qVals[y][x].up.toFixed(3)),x*pps+pps/2.45,y*pps+pps/10);
            ctx.fillText(String(that.qVals[y][x].down.toFixed(3)),x*pps+pps/2.45,y*pps+pps/1.03);
            ctx.fillText(String(that.qVals[y][x].left.toFixed(3)),x*pps+pps/28,y*pps+pps/2);
            ctx.fillText(String(that.qVals[y][x].right.toFixed(3)),x*pps+pps/1.5,y*pps+pps/2);
        }

        function drawRect(context, x, y) {
            var offset = 1; // Offset balances overlapping grid lines
            var xPos = x*pps+offset;
            var yPos = y*pps+offset;
            context.fillRect(xPos, yPos, pps-offset, pps-offset);
        }

        function handleKeyPress(e) {
            var keyCode = e.keyCode;
            switch (keyCode) {
                case 37:
                    that.move(-1, 0, 'left');
                    break; //Left key
                case 38: 
                    that.move(0, -1, 'up');
                    break; //Up key
                case 39: 
                    that.move(1, 0, 'right');
                    break; //Right key
                case 40: 
                    that.move(0, 1, 'down');
                    break; //Down key
                default: 
                    break;
            }
        }
    };
 
    return retModule;
});