// Create score, lives and level variables to be displayed by paintMessage()
var score = 0;
var lives = 3;
var level = 1;

// Set initial score goal to 10000. This is used by updateScore() in
// engine.js to set a baseline for awarding extra lives.
var scoreGoal = 10000;

// Set global collision detection flag. This will be off (0)
// when player is not in the path of enemies to avoid
// unnecessarily watching for collisions when one can't occur.
var detectCollisions = 0;

// Create enemy class. Accepts coordinate and speed parameters.
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    // Visually represent with animated SVG paper crane I created in July 2014
    // http://codepen.io/guttentag/pen/Ktbxu
    this.sprite = 'images/crane.svg';
};

// Update enemy position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Multiply enemy speed by time delta between ticks
    // and also by half your current level to present a challenge
    this.x = this.x + this.speed * (level / 2) * dt;
    // Reset enemy position after enemy leaves the board
    if (this.x > 550) {
        this.x = -160;
    }
    // If detectCollisions is on (the player is in a path of an enemy)
    if (detectCollisions == 1) {
        // Fire when a collision occurs
        if ((player.x - this.x) < 130 && (player.x - this.x) > 0 && (this.y - player.y == 59)) {
            // Turn detectCollisions back off to avoid sending mixed messages to paintMessage
            detectCollisions = 0;
            // Decrement lives variable
            lives -= 1;
            // Call gameOver() if no lives remain
            if (lives === 0) {
                gameOver();
            // Reposition player and paint explanatory message if lives remain
            } else {
            repositionPlayer();
            // An homage to Beyond Zork. Grues get a bad rap for eating adventurers
            // who forget to carry a light source in darkened areas of 1980s games.
            // You are more likely to be eaten by a paper bird in broad daylight.
            paintMessage("You have been eaten by a paper bird. How embarrassing.", "#f00");
            }
        // Paint urgent message if in path of an enemy but no collision yet
        } else {
            paintMessage("They're coming for you! Run, Emoji! RUN!!!", "#000");
        }
    }
};

// Render enemy
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Create player class. Accepts coordinate parameters.
var Player = function(x, y) {
    this.x = x;
    this.y = y;
    // Visually represent with char-boy.png image
    this.sprite = 'images/char-boy.png';
};

// Create gem class. Accepts coordinate parameters.
var Gem = function(x, y, duration) {
    this.x = x;
    this.y = y;
    // Visually represent with Gem Green.png image
    this.sprite = 'images/Gem Green.png';
};

// Update gem position
Gem.prototype.update = function(dt) {
    // If player has no lives left, position the gem offscreen
    if (lives < 1) {
        repositionGem();
    // Otherwise, generate random number to determine x position of the gem
    } else {
        var randomNumber = Math.random();
        // Determine x position based on the range of the generated number
        if (randomNumber > 0.79) {
            this.x = 404;
        } else if (randomNumber > 0.59 && randomNumber <= 0.79) {
            this.x = 303;
        } else if (randomNumber > 0.39 && randomNumber <= 0.59) {
            this.x = 202;
        } else if (randomNumber > 0.19 && randomNumber <= 0.39) {
            this.x = 101;
        } else {
            this.x = 0;
        }
        // Generate a new random number to determine y position of the gem.
        // We could reuse the random number we created earlier, but that
        // would result in the player seeing patterns in the x and y
        // coordinates which would make game play predictable and boring.
        randomNumber = Math.random();

        // Determine y position based on the range of the generated number
        if (randomNumber > 0.65) {
            this.y = 218;
        } else if (randomNumber > 0.32 && randomNumber <= 0.65) {
            this.y = 135;
        } else {
            this.y = 52;
        }
    }
};

// Render gem
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Update player
Player.prototype.update = function() {
    // no ops
};

// Render player
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Handle player input (fires on any key up)
Player.prototype.handleInput = function(keyPressed) {
    // As long as there are lives remaining...
    if (lives > 0) {
        // Store x and y coordinates in case keypress would put player out of bounds
        var originalX = this.x;
        var originalY = this.y;

        // Interpret directional key presses and move player accordingly
        if (keyPressed == 'up') {
            this.y = this.y - 83;
        } else if (keyPressed == 'down') {
            this.y = this.y + 83;
        } else if (keyPressed == 'left') {
            this.x = this.x - 101;
        } else if (keyPressed == 'right') {
            this.x = this.x + 101;
        }

        // Move character if it remains in bounds of the game board
        if (this.y > -13 && this.y < 404 && this.x > -3 && this.x < 403) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            // Clear the message area of any previous messages. Anything painted
            // on the canvas stays there until it is overwritten by something else,
            // so this line paints a blank message.
            paintMessage("", "#fff");

        // Prevent movement if it would put player out of bounds, using stored coordinates
        } else {
            this.x = originalX;
            this.y = originalY;
            // Inform player of the reason their keypress was ignored
            paintMessage("Not that way! You'll fall off the edge of the Earth, silly!", "#f00");
        }
        // If player reaches the water
        if (this.y < 71) {
            // Increment level
            level += 1;
            // Increment score by (current level * 10)
            updateScore(level * 10);
            // If current level number is divisible by 5
            if (level % 5 === 0) {
                // Award extra life
                lives += 1;
            }
            // Encourage the player, add a personal touch by identifying
            // the new level number and use blue text
            paintMessage("Well done! Welcome to Level " + level, "#00f");
            // Turn off collision detection because player will be out of the lanes
            detectCollisions = 0;
            // Move the player back to the bottom of the screen
            repositionPlayer();
        }

    // Detect gem collision only if the player is in a lane
    if (detectCollisions == 1) {
        // Fire when the player moves into a gem
        if ((player.x - gem.x) == -2 && (player.y - gem.y == 19)) {
            // Increment score by (current level * 1000)
            updateScore(level * 1000);
            // Move the gem offscreen to indicate it's been collected
            repositionGem();
        }
    }

    // If there are no lives remaining, enable game reset via Y keypress
    } else if (keyPressed == 'y') {
        // Return enemies, lives, score, level, player position
        // and message to original starting values
        allEnemies.push(enemy1, enemy2, enemy3);
        lives = 3;
        score = 0;
        level = 1;
        repositionPlayer();
        paintMessage('', '#fff');
    }

    // Turn on collision detection ONLY when player is in 1 of the 3 lanes
    if (this.y < 238 && this.y > 70) {
        detectCollisions = 1;
    } else {
        detectCollisions = 0;
    }
};

// Instantiate enemy objects
var enemy1 = new Enemy(-160, 130, 53);
var enemy2 = new Enemy(-160, 213, 60);
var enemy3 = new Enemy(-160, 296, 95);

// Create allEnemies array to hold enemies
var allEnemies = [];

// Place all enemy objects in allEnemies array
allEnemies.push(enemy1, enemy2, enemy3);

// Instantiate player object
var player = new Player(200, 403);

// Instantiate gem object
var gem = new Gem(-200, -403, 1);

// Listen for key presses, maps key code to key name.
// MODIFIED (despite comment stating modification unneccessary):
// Add event listeners for users who prefer WASD to arrow keys.
// Add event listener for Y during game over mode to fire restart.
// Obtained keycodes from a tool I created in March 2015 for fun:
// http://codepen.io/guttentag/pen/MYZZvG
// Check it out, but be sure to click in the bottom frame so it has
// focus and can listen for keypresses.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',  // left arrow
        38: 'up',    // up arrow
        39: 'right', // right arrow
        40: 'down',  // down arrow
        87: 'up',    // W
        65: 'left',  // A
        83: 'down',  // S
        68: 'right', // D
        89: 'y'      // Y
    };
    // Pass key name to Player.handleInput() method
    player.handleInput(allowedKeys[e.keyCode]);
});
