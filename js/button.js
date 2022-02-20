function Button(x, y, s, id) {
    this.x = x;
    this.y = y;
    this.w = s;
    this.h = s;
    this.id = id;
    this.pulse = 0;

    this.show = function () {
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
        }
        if (this.pulse > 0) {
            this.pulse--;
        }
    }


    this.update = function () {
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
            }
        }
    }

    this.touchingMouse = function () {
        return this.x - this.w / 2 < mouseX && this.x + this.w / 2 > mouseX && this.y - this.h / 2 < mouseY && this.y + this.h / 2 > mouseY;
    }

}