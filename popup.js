function Popup(id) {
    isPopup = true;
    this.x = width / 2;
    this.y = height * 3 / 2;
    this.w = height / 3 + width / 8;
    this.h = height * 7 / 10;
    this.lineLen = this.w / 80;
    this.closing = false;

    this.show = function () {

        if (!this.closing) {
            this.y = lerp(this.y, height / 2, 0.1);
        } else {
            this.y = lerp(this.y, height * 3 / 2, 0.1);
        }
        if (this.y > height && this.closing) {
            isPopup = false;
        }

        rectMode(CENTER);
        noStroke();
        for (let i = 50; i > 0; i--) {
            fill(205 + i, 5);
            rect(this.x, this.y, this.w + i, this.h + i, (this.w + i) / 20);
        }
        fill(255);
        rect(this.x, this.y, this.w, this.h, this.w / 20);

        textAlign(CENTER, CENTER);
        textSize(this.w / 20);
        textFont(font);
        textWrap(WORD);
        fill(0);

        switch (id) {
            case "welcome":
                text("Welcome to Word Bord!\n\n\nClick and drag to rotate rows and columns to create five-letter words", this.x, this.y - this.h / 4, this.w * 9 / 10);
                break;
        }

        push();
        stroke(0);
        strokeWeight(1);
        translate(this.x + this.w * 7 / 16, this.y - this.h * 7 / 16);
        line(-this.lineLen, -this.lineLen, this.lineLen, this.lineLen);
        line(this.lineLen, -this.lineLen, -this.lineLen, this.lineLen);
        pop();
    }

    this.onClick = function () {
        if (dist(this.x + this.w * 7 / 16, this.y - this.h * 7 / 16, mouseX, mouseY) < this.lineLen * 2) {
            this.closing = true;
        }
    }
}