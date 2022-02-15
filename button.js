function Button(x, y, s, id) {
    this.x = x;
    this.y = y;
    this.w = s;
    this.h = s;
    this.id = id;

    this.show = function() {
        switch (id) {
            case "settings":
                noStroke();
                fill(0 + darkModeColor);
                textFont(icons);
                textAlign(CENTER, CENTER);
                textSize(this.w);
                text('\uf1de', this.x, this.y);
                // text('\uf013', mouseX, mouseY);
                // text('\uf021', mouseX, mouseY);
                break;
        }
    }


    this.update = function () {
        if (this.touchingMouse()) {
            switch(id) {
                case "settings":
                    popup = new Popup("settings");
                    break;
            }
        }
    }

    this.touchingMouse = function () {
        return this.x - this.w / 2 < mouseX && this.x + this.w / 2 > mouseX && this.y - this.h / 2 < mouseY && this.y + this.h / 2 > mouseY;
    }

}