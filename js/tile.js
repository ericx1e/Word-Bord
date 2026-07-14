function Tile(r, c, s) {
    this.r = r;
    this.c = c
    this.x = width / 2 + c * tileSize - (boardSize - 1) / 2 * tileSize;
    this.y = height / 2 + r * tileSize - (boardSize - 1) / 2 * tileSize;
    this.s = s;
    this.highlightDur = 0;
    //fixed per-tile jitter so each tile looks hand-placed without flickering
    this.tilt = random(-0.05, 0.05);
    this.radiusJitter = random(0.8, 1.25);

    this.show = function () {
        const size = tileSize * 9 / 10;

        push();
        translate(this.x, this.y);
        rotate(this.tilt);

        //found words flash highlighter yellow, then fade back to paper
        if (this.highlightDur > 0) {
            fill(lerpColor(tileC, accentC, Math.min(this.highlightDur, 120) / 120));
            this.highlightDur -= 6;
        } else {
            fill(tileC);
        }
        stroke(inkC);
        strokeWeight(Math.max(1.5, tileSize / 40));
        rect(0, 0, size, size, tileSize / 5.5 * this.radiusJitter);

        //second, fainter outline slightly off from the first reads as sketched ink
        noFill();
        stroke(red(inkC), green(inkC), blue(inkC), 70);
        rect(0, 0, size * 1.035, size * 1.02, tileSize / 4.5 * this.radiusJitter);

        fill(inkC);
        noStroke();
        textFont(font);
        textAlign(CENTER, CENTER);
        textSize(tileSize / 1.9);
        text(this.s, 0, tileSize * 0.02);
        pop();
    }

    this.move = function (r, c) {
        this.r = r;
        this.c = c;
    }

    this.update = function () {
        this.x = lerp(this.x, width / 2 + this.c * tileSize - (boardSize - 1) / 2 * tileSize, 0.2);
        this.y = lerp(this.y, height / 2 + this.r * tileSize - (boardSize - 1) / 2 * tileSize, 0.2);
    }
}


function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}
