function Button(x, y, s, id) {
    this.x = x;
    this.y = y;
    this.w = s;
    this.h = s;
    this.id = id;
    this.pulse = 0;
    this.disabledDuringReplay = ["undo", "reset", "leaderboard", "settings"];

    this.show = function () {
        if (playingPrevSoln) {
            if (this.disabledDuringReplay.includes(id)) {
                return;
            }
        }
        switch (id) {
            case "settings":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w + this.pulse);
                text('\uf1de', this.x, this.y);
                // text('\uf013', mouseX, mouseY);
                // text('\uf021', mouseX, mouseY);
                break;
            case "undo":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w + this.pulse);
                text('\uf0e2', this.x, this.y);
                break;
            case "reset":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w + this.pulse);
                text('\uf021', this.x, this.y);
                break;
            case "info":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w + this.pulse);
                text('\uf129', this.x, this.y);
                break;
            case "leaderboard":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w + this.pulse);
                text('\uf091', this.x, this.y);
                break;
            case "prevsoln":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w + this.pulse);
                if (playingPrevSoln) {
                    text('\uf04d', this.x, this.y); //stop icon
                } else {
                    text('\uf122', this.x, this.y); //replay icon
                }
                break;
        }
        if (this.pulse > 0) {
            this.pulse--;
        }
    }


    this.update = function () {
        if (playingPrevSoln) {
            if (this.disabledDuringReplay.includes(id)) {
                return;
            }
        }
        if (this.touchingMouse()) {
            this.pulse = this.w / 3;
            switch (id) {
                case "settings":
                    popup = new Popup("settings");
                    break;
                case "undo":
                    undo();
                    break;
                case "reset":
                    reset();
                    break;
                case "info":
                    popup = new Popup("welcome");
                    break;
                case "leaderboard":
                    popup = new Popup("leaderboard");
                    break;
                case "prevsoln":
                    popup = new Popup("prevsoln");
                    break;
            }
        }
    }

    this.touchingMouse = function () {
        return this.x - this.w / 2 < mouseX && this.x + this.w / 2 > mouseX && this.y - this.h / 2 < mouseY && this.y + this.h / 2 > mouseY;
    }

}