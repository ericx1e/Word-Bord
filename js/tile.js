function Tile(r, c, s) {
    this.r = r;
    this.c = c
    this.x = width / 2 + c * tileSize - (boardSize - 1) / 2 * tileSize;
    this.y = height / 2 + r * tileSize - (boardSize - 1) / 2 * tileSize;
    this.s = s;
    this.highlightDur = 0;
    //fixed per-tile jitter so each tile looks hand-placed without flickering
    this.tilt = random(-0.05, 0.05);
    this.bucket = Math.floor(random(3)); //picks one of the cached tile faces

    this.show = function () {
        push();
        translate(this.x, this.y);
        rotate(this.tilt);

        if (this.highlightDur > 0) {
            //found-word flash: draw the face live so the fill can fade back to paper
            const size = tileSize * 9 / 10;
            const rj = 0.8 + 0.2 * this.bucket;
            fill(lerpColor(tileC, accentC, Math.min(this.highlightDur, 120) / 120));
            this.highlightDur -= 6;
            stroke(inkC);
            strokeWeight(Math.max(1.5, tileSize / 40));
            rect(0, 0, size, size, tileSize / 5.5 * rj);
            noFill();
            stroke(red(inkC), green(inkC), blue(inkC), 70);
            rect(0, 0, size * 1.035, size * 1.02, tileSize / 4.5 * rj);
        } else {
            //settled face is a cached sprite: one blit instead of two path strokes
            const g = tileSprite(this.bucket);
            image(g, -g.width / 2, -g.height / 2);
        }

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
