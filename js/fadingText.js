function FadingText(x, y, s) {
    this.life = 255;
    this.x = x;
    this.y = y;
    this.s = s;

    this.show = function () {
        fill(50 + darkModeColor, this.life);
        noStroke();
        textSize(height / 50 + width / 50);
        textFont(font2);
        text(this.s, this.x, this.y);
        this.y -= 1;
        this.life -= 2;
    }
}