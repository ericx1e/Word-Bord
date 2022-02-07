function Tile(r, c, s) {
    this.r = r;
    this.c = c
    this.x = width / 2 + c * tileSize - 2 * tileSize;
    this.y = height / 2 + r * tileSize - 2 * tileSize;
    this.s = s;

    this.show = function () {
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(tileSize / 2);
        fill(80);
        rect(this.x, this.y, tileSize * 9.4 / 10, tileSize * 9.4 / 10, tileSize / 5);
        fill(130);
        rect(this.x, this.y, tileSize * 9 / 10, tileSize * 9 / 10, tileSize / 5);
        fill(255);
        text(this.s, this.x, this.y);
    }

    this.move = function (r, c) {
        this.r = r;
        this.c = c;
        this.x = width / 2 + c * tileSize - 2 * tileSize;
        this.y = height / 2 + r * tileSize - 2 * tileSize;
    }
}