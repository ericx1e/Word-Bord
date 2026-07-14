function SlidingButton(x, y, w, offset, id) {
    this.x = x;
    this.y = y;
    this.fullW = w;
    this.w = w / 10;
    this.h = this.w / 2;
    this.offset = offset;
    this.toggle = false; //false is left, true is right
    this.buttonX = this.x + this.w / 4;
    switch (id) {
        case "dark mode":
            this.toggle = darkMode;
            break;
        case "board size":
            this.toggle = (boardSize == 5);
            break;
        case "show found":
            this.toggle = showFound;
            break;
    }

    this.show = function () {
        let tx = "";
        textAlign(LEFT, CENTER);
        switch (id) {
            case "dark mode":
                tx = "Dark mode";
                break;
            case "board size":
                tx = "Bord Size";
                break;
            case "show found":
                tx = "Show Found Words";
                break;
        }

        fill(inkC);
        textSize(this.h / 1.5);
        text(tx, this.x - this.fullW * 12.5 / 16, this.y);

        //knob position doubles as the on/off amount for the track color
        const onAmt = constrain(map(this.buttonX, this.x - this.w / 4, this.x + this.w / 4, 0, 1), 0, 1);

        rectMode(CENTER);
        stroke(inkC);
        strokeWeight(2);
        fill(lerpColor(paperC, accentC, onAmt));
        rect(this.x, this.y, this.w, this.h, this.h / 2);
        fill(tileC);
        ellipse(this.buttonX, this.y, this.h * 9 / 10, this.h * 9 / 10);

        noStroke();
        fill(inkC);
        textAlign(CENTER, CENTER);
        textSize(this.h / 3);
        switch (id) {
            case "dark mode":
                text(this.toggle ? "ON" : "OFF", this.buttonX, this.y);
                break;
            case "board size":
                text(this.toggle ? "5" : "4", this.buttonX, this.y);
                break;
            case "show found":
                text(this.toggle ? "ON" : "OFF", this.buttonX, this.y);
                break;
        }

    }

    this.update = function () {
        if (this.toggle) {
            this.buttonX = lerp(this.buttonX, this.x + this.w / 4, 0.1);
        } else {
            this.buttonX = lerp(this.buttonX, this.x - this.w / 4, 0.1);
        }
        switch (id) {
            case "dark mode":
                darkMode = this.toggle;
                break;
            case "board size":
                boardSize = this.toggle ? 5 : 4;
                break;
            case "show found":
                showFound = this.toggle;
                break;
        }
    }

    this.click = function () {
        if (this.touchingMouse()) {
            this.toggle = !this.toggle;
            if (id == "board size") {
                this.update();
                fadingTexts = [];
                boardCreated = false;
                board = [];
                buttons = [];
                rot = 0; //how much we've rotated a rot or col
                dict;
                wordsFound = [];
                score = 0;
                moves = 20;
                movesMade = [];
                preload();
                setup();
                popup.closing = true;
            }
        }
    }

    this.touchingMouse = function () {
        return this.x - this.w / 2 < mouseX && this.x + this.w / 2 > mouseX && this.y - this.h / 2 < mouseY && this.y + this.h / 2 > mouseY;
    }
}