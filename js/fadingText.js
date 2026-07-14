function FadingText(x, y, s) {
    this.life = 255;
    this.x = x;
    this.y = y;
    this.s = s;
    this.tilt = random(-0.08, 0.08); //scribbled-in-the-margin feel

    this.show = function () {
        push();
        translate(this.x, this.y);
        rotate(this.tilt);
        fill(red(inkC), green(inkC), blue(inkC), this.life);
        noStroke();
        textSize(height / 50 + width / 50);
        textFont(font2);
        text(this.s, 0, 0);
        pop();
        this.y -= width / 2000 + height / 5000;
        this.life -= 2;
    }
}