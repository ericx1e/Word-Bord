function SlidingButton(x, y, w, offset, id) {
    this.x = x;
    this.y = y;
    this.fullW = w;
    this.w = w / 10;
    this.h = this.w / 2;
    this.offset = offset;
    this.toggle = false; //false is left, true is right
    this.buttonX = this.x + this.w / 4;
    this.color = 220;
    switch (id) {
        case "dark mode":
            this.toggle = darkMode;
            break;
    }

    this.show = function () {
        let tx = "";
        textAlign(LEFT, CENTER);
        switch (id) {
            case "dark mode":
                tx = "Dark mode";
                break;
        }

        fill(0);
        textSize(this.h / 1.5);
        text(tx, this.x - this.fullW * 12.5 / 16, this.y);

        rectMode(CENTER);
        noStroke();
        fill(this.color);
        rect(this.x, this.y, this.w, this.h, this.h / 2);
        fill(this.color / 2);
        ellipse(this.buttonX, this.y, this.h * 9 / 10, this.h * 9 / 10);

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(this.h / 3);
        text(this.toggle ? "ON" : "OFF", this.buttonX, this.y);

    }

    this.update = function () {
        if (this.toggle) {
            this.buttonX = lerp(this.buttonX, this.x + this.w / 4, 0.1);
            this.color += 1.5 * (lerp(this.buttonX, this.x + this.w / 4, 0.2) - this.buttonX);
        } else {
            this.buttonX = lerp(this.buttonX, this.x - this.w / 4, 0.1);
            this.color += 1.5 * (lerp(this.buttonX, this.x - this.w / 4, 0.2) - this.buttonX);
        }
        switch (id) {
            case "dark mode":
                darkMode = this.toggle;
                break;
        }
    }

    this.click = function () {
        if (this.touchingMouse()) {
            this.toggle = !this.toggle;
        }
    }

    this.touchingMouse = function () {
        return this.x - this.w / 2 < mouseX && this.x + this.w / 2 > mouseX && this.y - this.h / 2 < mouseY && this.y + this.h / 2 > mouseY;
    }
}