function Button(x, y, s, id) {
    this.x = x;
    this.y = y;
    this.w = s;
    this.h = s;
    this.id = id;
    this.pulse = 0;
    this.tilt = random(-0.09, 0.09); //fixed wobble so buttons look hand-placed
    this.disabledDuringReplay = ["undo", "reset", "settings"];

    this.show = function () {
        if (playingPrevSoln) {
            if (this.disabledDuringReplay.includes(id)) {
                return;
            }
        }

        const s = this.w + this.pulse;
        //undo/reset fade out when there is nothing to undo
        const a = this.enabled() ? 255 : 60;

        push();
        translate(this.x, this.y);
        rotate(this.tilt);
        rectMode(CENTER);

        //sticker-style backing to match the tiles
        stroke(red(inkC), green(inkC), blue(inkC), a);
        strokeWeight(Math.max(1.5, s / 16));
        fill(tileC);
        ellipse(0, 0, s * 1.75, s * 1.68);
        noFill();
        stroke(red(inkC), green(inkC), blue(inkC), Math.min(70, a));
        ellipse(0, 0, s * 1.84, s * 1.78);

        stroke(red(inkC), green(inkC), blue(inkC), a);
        strokeWeight(Math.max(1.5, s / 8));
        noFill();

        switch (id) {
            case "info":
                noStroke();
                fill(inkC);
                textFont(font);
                textAlign(CENTER, CENTER);
                textSize(s * 1.2);
                text("i", 0, s * 0.02);
                break;
            case "settings":
                this.drawSliders(s);
                break;
            case "undo":
                //counterclockwise arrow
                this.drawArcArrow(s, -HALF_PI, PI * 0.75, true);
                break;
            case "reset":
                //two opposing half-circle arrows, like a refresh icon
                this.drawArcArrow(s, -PI * 0.85, -PI * 0.15, false);
                this.drawArcArrow(s, PI * 0.15, PI * 0.85, false);
                break;
            case "prevsoln":
                if (playingPrevSoln) {
                    rect(0, 0, s * 0.75, s * 0.75, s * 0.18); //stop
                } else {
                    //play triangle
                    beginShape();
                    vertex(-s * 0.28, -s * 0.42);
                    vertex(-s * 0.28, s * 0.42);
                    vertex(s * 0.48, 0);
                    endShape(CLOSE);
                }
                break;
        }

        pop();

        if (this.pulse > 0) {
            this.pulse--;
        }
    }

    //arc with a hand-drawn arrowhead; headAtStart flips which end gets the head
    this.drawArcArrow = function (s, a0, a1, headAtStart) {
        const r = s * 0.5;
        arc(0, 0, r * 2, r * 2, a0, a1);

        const a = headAtStart ? a0 : a1;
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);
        //tangent along the travel direction at this end
        const t = headAtStart ? a - HALF_PI : a + HALF_PI;
        const b = s * 0.34;
        line(px, py, px + Math.cos(t + PI - 0.55) * b, py + Math.sin(t + PI - 0.55) * b);
        line(px, py, px + Math.cos(t + PI + 0.55) * b, py + Math.sin(t + PI + 0.55) * b);
    }

    this.drawSliders = function (s) {
        const l = s * 0.55;
        const ys = [-s * 0.34, 0, s * 0.34];
        const knobX = [l * 0.4, -l * 0.35, l * 0.1];
        for (let i = 0; i < 3; i++) {
            line(-l, ys[i], l, ys[i]);
        }
        fill(tileC);
        strokeWeight(Math.max(1.5, s / 10));
        for (let i = 0; i < 3; i++) {
            circle(knobX[i], ys[i], s * 0.3);
        }
    }

    this.enabled = function () {
        return !((id == "undo" || id == "reset") && movesMade.length == 0);
    }

    this.update = function () {
        if (playingPrevSoln) {
            if (this.disabledDuringReplay.includes(id)) {
                return;
            }
        }
        if (!this.enabled()) {
            return;
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
                    popup = new Popup("resetconfirm"); //confirm before wiping progress
                    break;
                case "info":
                    popup = new Popup("welcome");
                    break;
                case "prevsoln":
                    popup = new Popup("prevsoln");
                    break;
            }
        }
    }

    this.touchingMouse = function () {
        //circular hit area matching the sticker badge
        return dist(mouseX, mouseY, this.x, this.y) < this.w * 0.95;
    }

}
