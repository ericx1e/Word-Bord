function Popup(id) {
    isPopup = true;
    this.x = width / 2;
    this.y = height * 3 / 2;
    this.w = height / 3 + width / 6;
    this.h = height * 7 / 10;
    this.lineLen = this.w / 80;
    this.closing = false;
    this.buttons = [];

    if (id == "settings") {
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, -this.h / 4, "dark mode"));
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, -this.h / 8, "board size"));
        // this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, 0, "dark mode"));
        // this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, this.h / 8, "dark mode"));
        // this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, this.h / 4, "dark mode"));
    }

    this.show = function () {

        if (!this.closing) {
            this.y = lerp(this.y, height / 2, 0.1);
            this.buttons.forEach(button => {
                button.y = lerp(button.y, height / 2 + button.offset, 0.1);
            });
        } else {
            this.y = lerp(this.y, height * 3 / 2, 0.07);
            this.buttons.forEach(button => {
                button.y = lerp(button.y, height * 3 / 2 + button.offset, 0.07);
            });
        }
        if (this.y > height * 10 / 7 && this.closing) {
            isPopup = false;
        }

        rectMode(CENTER);
        noStroke();
        for (let i = 50; i > 0; i--) {
            fill(205 + i - darkModeColor, 5);
            rect(this.x, this.y, this.w + i, this.h + i, (this.w + i) / 20);
        }
        fill(255 - darkModeColor);
        rect(this.x, this.y, this.w, this.h, this.w / 20);

        textAlign(CENTER, CENTER);
        textSize(this.w / 24);
        textFont(font);
        textWrap(WORD);
        fill(0 + darkModeColor);

        switch (id) {
            case "welcome":
                text("Welcome to Word Bord!\n\n\nClick and drag to rotate rows and columns to create five-letter words\n\nWords can be formed regularly or backwards on any row or column\n\nScore as many points as possible in 50 moves\n\nCome back every day for a new Word Bord!\n\n\n\nMade by Eric Xie", this.x, this.y - this.h / 2.8, this.w * 9 / 10);
                break;
            case "gameover":
                text("Out of moves!\n\n\nYou scored " + score + " points \n\nReload the page to try again or come back tomorrow for a new Word Bord", this.x, this.y - this.h / 4, this.w * 9 / 10);
                break;
            case "settings":
                text("Settings", this.x, this.y - this.h / 2.5, this.w * 9 / 10);
                break;
        }

        this.buttons.forEach(button => {
            button.show();
            button.update();
        });

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
        this.buttons.forEach(button => {
            button.click();
        });
    }
}