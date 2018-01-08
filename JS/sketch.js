/*
 *  The code here is mine, kk thx.
 */
let bubbles = [];
let nbBubbles = 30;

// When a bubble burst
let minNbOffspring = 2;
let maxNbOffspring = 4;

// If the bubbles are bouncing or attracting
// Set to 1 to bounce;
// Set to -1 to attract.
let repulsion = 1;

// If you want to see gravity.
let gravity = false;

function setup() {
    createCanvas(displayWidth * 0.98, displayHeight * 0.9);
    colorMode(HSB);
    //frameRate(1);
    background(0);
    for (let i = 0; i <= nbBubbles; i++) {
        bubbles.push(new Bubble(repulsion, gravity));
    }
}



function draw() {
    //console.log(bubbles.length);
    background(0);
    // Check if bubbles are going out of bound.
    for (let i = bubbles.length-1; i >= 0; i--) {
        // This is how we know they got sucked in.
        if (bubbles[i].r < 5) {
            bubbles.splice(i, 1);
        } else if (bubbles[i].r > 125) {
            let nbOffspring = floor(random(minNbOffspring, maxNbOffspring + 1));
            if (nbOffspring > 0) {
                let x = bubbles[i].x;
                let y = bubbles[i].y;
                let r = bubbles[i].r;
                for (let i = 0; i < nbOffspring; i++) {
                    bubbles.push(new Bubble(repulsion, gravity, random(x-r, x+r), random(y-r, y+r), r/(2*nbOffspring)));
                }
            }
            // We kill the original.
            bubbles.splice(i, 1);
        }
    }

    // Check if bubbles are touching.
    for (let i = 0; i < bubbles.length-1; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
            if (bubbles[i].intersects(bubbles[j])) {
                bubbles[i].addIntersectingBubble(bubbles[j]);
                bubbles[j].addIntersectingBubble(bubbles[i]);
            }
        }
    }
    // Show everything
    for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].show();
    }

    // refill bubbles array if too many died.
    if (bubbles.length < nbBubbles) {
        bubbles.push(new Bubble(repulsion, gravity));
    }

    // Hide borders
    /*fill(50);
    strokeWeight(0);
    rect(0, 0, 20, height);
    rect(width-20, 0, width, height);
    rect(0, 0, width, 20);
    rect(0, height-20, width, height);*/

}

class Bubble {
    constructor(repulsion, gravity, x=random(displayWidth), y=random(displayHeight), r=random(10,50)) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = createVector(random(-2, 2), random(-2, 2));
        this.brightness = 0;
        this.hisIntersectingBubbles = [];
        // Used in the check to see if bubbles are attracting to each others.
        this.repulsion = repulsion;
        // Used to see if bubbles are falling.
        this.gravity = gravity;
    }

    changeColor(newBrightness) {
        this.brightness = newBrightness;
    }

    move() {
        this.x += this.speed.x;
        this.y += this.speed.y;
        this.hisIntersectingBubbles = [];
        // They bounces on the boundaries.
        this.checkBoundaries();
        if (this.gravity) {
            this.speed.y += 0.07
        }
    }

    show() {
        stroke(255);
        strokeWeight(2);
        fill(this.brightness, 125);
        if (this.hisIntersectingBubbles.length > 0) {
            // arc(X, Y, X_LENGTH, Y_LENGTH, STARTING_ANGLE, END_ANGLE, ARC_TYPE);

            // Depending on mode.
            this.transferMass();

            // There is only 1 intersecting bubble.
            if (this.hisIntersectingBubbles.length === 1) {
                // TODO, adjust the space of the arc. the angles are slightly off, somehow.
                let distance = dist(this.x, this.y, this.hisIntersectingBubbles[0].x, this.hisIntersectingBubbles[0].y)
                let diffX = this.x - this.hisIntersectingBubbles[0].x;
                let diffY = this.y - this.hisIntersectingBubbles[0].y;
                let crossingLength = this.r - (this.r + this.hisIntersectingBubbles[0].r - distance)/2;
                let mainAngle = -atan(diffX / diffY);
                if (diffX > 0) {
                    if (diffY < 0) {
                        mainAngle += PI / 2;
                    }
                    if (diffY > 0) {
                        mainAngle -= PI / 2;
                    }
                }
                if ((diffX < 0) && (diffY < 0)) {
                    mainAngle += PI/2;
                }
                if ((diffX < 0) && (diffY > 0)) {
                    mainAngle -= PI/2;
                }
                let midAngle = abs(cos(crossingLength/this.r));
                let startAngle = mainAngle + midAngle;
                let endAngle = mainAngle - midAngle;
                arc(this.x, this.y, this.r * 2, this.r * 2, startAngle, endAngle, OPEN);

            // There is more than 1 bubble intersecting.
            } else {
                // TODO make this actually do more arcs... not really necessary with repulsion.
                let diffX = this.x - this.hisIntersectingBubbles[0].x;
                let diffY = this.y - this.hisIntersectingBubbles[0].y;
                let crossingLength = this.r - (this.r + this.hisIntersectingBubbles[0].r - dist(this.x, this.y, this.hisIntersectingBubbles[0].x, this.hisIntersectingBubbles[0].y))/2;
                let mainAngle = -atan(diffX / diffY);
                if (diffX > 0) {
                    if (diffY < 0) {
                        mainAngle += PI / 2;
                    }
                    if (diffY > 0) {
                        mainAngle -= PI / 2;
                    }
                }
                if (diffX < 0) {
                    if (diffY < 0) {
                        mainAngle += PI / 2;
                    }
                    if (diffY > 0) {
                        mainAngle -= PI / 2;
                    }
                }
                let midAngle = abs(cos(crossingLength/this.r));
                let startAngle = mainAngle + midAngle;
                let endAngle = mainAngle - midAngle;
                arc(this.x, this.y, this.r * 2, this.r * 2, startAngle, endAngle, OPEN);
            }
        } else {
            ellipse(this.x, this.y, this.r * 2);
        }
        // We adjust the speed, with regards of collisions.
        this.ajustSpeed();
        // We actually move the bubble.
        this.move();
    }

    // Adjusts the speed, with regards of collisions.
    ajustSpeed() {
        // No need to adjust speed if touching to anything.
        if (this.hisIntersectingBubbles.length > 0) {
            let adjustmentVector = createVector(0, 0);
            for (let i = 0; i < this.hisIntersectingBubbles.length ; i++) {
                adjustmentVector.x += this.repulsion * (this.x - this.hisIntersectingBubbles[i].x)/200;
                adjustmentVector.y += this.repulsion * (this.y - this.hisIntersectingBubbles[i].y)/200;
            }
            this.speed.x += adjustmentVector.x;
            this.speed.y += adjustmentVector.y;
        }
    }

    // Makes the bubble rebound.
    checkBoundaries() {
        if ((this.x - this.r) < 0) {
            this.speed.x = abs(this.speed.x * -1);
        } else if ((this.x + this.r) > width) {
            this.speed.x = -abs(this.speed.x * -1);
        } else if ((this.y - this.r) < 0) {
            this.speed.y = abs(this.speed.y * -1);
        } else if ((this.y + this.r) > height) {
            this.speed.y = - abs(this.speed.y * -1);
        }
    }

    // If there is a connection between 2 bubbles.
    intersects(otherBubble) {
        let d = dist(this.x, this.y, otherBubble.x, otherBubble.y);
        // console.log(d + " " + (this.r + otherBubble.r) + " " + (d < this.r + otherBubble.r));
        return (d < this.r + otherBubble.r);
    }

    // add it to the list of the itnersecting bubbles (POINTERS WOULD BE AWESOME HERE)
    addIntersectingBubble(otherBubble) {
        this.hisIntersectingBubbles.push(otherBubble);
        // this.changeColor(125);
    }

    // A way to pass the mass to the actual biggest bubble.
    transferMass() {
        let distance = 0;
        for(let i = 0; i < this.hisIntersectingBubbles.length; i++) {
            distance = dist(this.x, this.y, this.hisIntersectingBubbles[i].x, this.hisIntersectingBubbles[i].y);
            if (this.r > this.hisIntersectingBubbles[i].r) {
                if (this.r > distance) {
                    this.getAllWeight(this.hisIntersectingBubbles[0]);
                    return;
                }
            } else if (this.r < this.hisIntersectingBubbles[0].r) {
                if (this.hisIntersectingBubbles[0].r > distance) {
                    this.hisIntersectingBubbles[0].getAllWeight(this);
                    return;
                }
            }
            // Stealing mass Argar.io style.
            // Works best if repulsion is -1, because I said so.
            if (this.repulsion === -1) {
                if (this.r > this.hisIntersectingBubbles[i].r) {
                    this.gainWeight();
                    this.hisIntersectingBubbles[i].loseWeight();
                } else {
                    this.r -= 0.1;
                    this.hisIntersectingBubbles[i].r += 0.1;
                }
            }
        }
    }

    loseWeight() {
        this.r -= 0.1;
    }

    loseAllWeight() {
        this.r = 1;
    }

    gainThisWeight(weight) {
        this.r += weight;
    }

    gainWeight() {
        this.r += 0.1;
    }

    getAllWeight(otherBubble) {
        this.gainThisWeight(otherBubble.r);
        otherBubble.loseAllWeight();
    }
}