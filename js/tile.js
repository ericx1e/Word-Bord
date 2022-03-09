function Tile(r, c, s) {
    this.r = r;
    this.c = c
    this.x = width / 2 + c * tileSize - (boardSize - 1) / 2 * tileSize;
    this.y = height / 2 + r * tileSize - (boardSize - 1) / 2 * tileSize;
    this.s = s;
    this.highlightDur = 0;

    this.show = function () {
        // noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize / 2);

        if (this.highlightDur > 0) {
            stroke(80, 80 + this.highlightDur, 80);
            this.highlightDur -= 3;
        } else {
            stroke(80);
        }
        strokeWeight(tileSize/25);

        // rect(this.x, this.y, tileSize * 9.4 / 10, tileSize * 9.4 / 10, tileSize / 5);
        // fill(130);

        if (this.highlightDur > 0) {
            fill(130 - darkModeColor/3, 130 + this.highlightDur - darkModeColor/3, 130 - darkModeColor/3);
            this.highlightDur -= 3;
        } else {
            fill(130 - darkModeColor/3);
        }

        rect(this.x, this.y, tileSize * 9 / 10, tileSize * 9 / 10, tileSize / 6);
        fill(255 - darkModeColor/4);
        noStroke();
        text(this.s, this.x, this.y);
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
