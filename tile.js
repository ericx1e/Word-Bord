function Tile(r, c, s) {
    this.r = r;
    this.c = c
    this.x = width / 2 + c * tileSize - 2 * tileSize;
    this.y = height / 2 + r * tileSize - 2 * tileSize;
    this.s = s;
    this.highlightDur = 0;

    this.show = function () {
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize / 2);

        if (this.highlightDur > 0) {
            fill(80, 80 + this.highlightDur, 80);
            this.highlightDur -= 3;
        } else {
            fill(80);
        }

        rect(this.x, this.y, tileSize * 9.4 / 10, tileSize * 9.4 / 10, tileSize / 5);
        // fill(130);
        
        if (this.highlightDur > 0) {
            fill(130, 130 + this.highlightDur, 130);
            this.highlightDur -= 3;
        } else {
            fill(130);
        }

        rect(this.x, this.y, tileSize * 9 / 10, tileSize * 9 / 10, tileSize / 5);
        fill(255);
        text(this.s, this.x, this.y);
    }

    this.move = function (r, c) {
        this.r = r;
        this.c = c;
    }

    this.update = function () {
        this.x = lerp(this.x, width / 2 + this.c * tileSize - 2 * tileSize, 0.2);
        // console.log(this.x);
        this.y = lerp(this.y, height / 2 + this.r * tileSize - 2 * tileSize, 0.2);
    }
}


function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}
