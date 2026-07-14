function Popup(id) {
    this.id = id;
    this.x = width / 2;
    this.y = height * 3 / 2;
    this.w = height / 3 + width / 6;
    this.h = height * 7 / 10;
    this.lineLen = this.w / 120 + this.h / 100;
    this.lineOffset = this.lineLen * 3;
    this.closing = false;
    this.buttons = [];
    let iconSize = this.w / 12;

    this.links;

    if (id == "welcome") {
        this.links = []
        this.links.push(createA('https://github.com/ericx1e', "").class("fab fa-github fa-3x"));
        // this.links.push(createA('https://24thegame.com', "").class("fab fa-youtube fa-3x"));
        // this.links.push(createA('https://24thegame.com', "").class("fab fa-twitter fa-3x"));
        // a.style("font-family", "Font Awesome 5 Free");

        this.links.forEach(link => {
            link.style('font-size', iconSize + 'px');
            link.style("color", "grey")
            link.style("text-decoration", "none")
        })
    }

    if (id == "settings") {
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, -this.h / 4, "dark mode"));
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, -this.h / 8, "board size"));
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, 0, "show found"));
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
            if (this.links) {
                this.links.forEach(link => {
                    link.remove();
                });
            }
            popup = undefined;
        }

        rectMode(CENTER);
        //flat offset shadow: one rect for a paper-cutout feel (the old glow drew ~25 rects per frame)
        noStroke();
        fill(red(inkC), green(inkC), blue(inkC), 30);
        rect(this.x + this.w / 60, this.y + this.w / 45, this.w, this.h, this.w / 20);

        fill(tileC);
        stroke(inkC);
        strokeWeight(2.5);
        rect(this.x, this.y, this.w, this.h, this.w / 20);
        //fainter second outline for a sketched-ink border
        noFill();
        stroke(red(inkC), green(inkC), blue(inkC), 70);
        rect(this.x, this.y, this.w * 1.012, this.h * 1.015, this.w / 17);

        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.h / 35 + this.w / 90);
        textFont(font);
        textWrap(WORD);
        fill(inkC);

        switch (id) {
            case "welcome":
                text("Click and drag to rotate rows and columns to create words\n\nChoose a 4x4 or 5x5 bord in the settings\n\nWords can be formed regularly or backwards on any row or column\n\nScore as many points as possible in 20 moves\n\nCome back every day for a new Word Bord!\n\n\nMade by Eric Xie", this.x, this.y - this.h / 2.5, this.w * 9 / 10);

                if (this.links) {
                    this.links.forEach((link, i) => {
                        link.position(this.x + iconSize / 2 + 2 * i * iconSize - this.links.length * iconSize, this.y + this.h / 2 - iconSize * 2);
                    });
                }
                break;
            case "gameover":
                text(`Out of moves!\n\n\nYou scored ${score} points \n\nRestart to try again or come back tomorrow for a new Word Bord`, this.x, this.y - this.h / 4, this.w * 9 / 10);
                break;
            case "settings":
                text("Settings", this.x, this.y - this.h / 2.5, this.w * 9 / 10);
                break;
            case "prevsoln":
                if (playingPrevSoln) {
                    text("Click to exit replay", this.x, this.y - this.h / 3, this.w * 9 / 10);
                } else {
                    text("Click to see yesterday's maximum score\n\nWarning: this will erase your current progress", this.x, this.y - this.h / 3, this.w * 9 / 10);
                }
                break;
        }

        this.buttons.forEach(button => {
            button.show();
            button.update();
        });

        push();
        stroke(inkC);
        strokeWeight(3);
        translate(this.x + this.w / 2 - this.lineOffset, this.y - this.h / 2 + this.lineOffset);
        line(-this.lineLen, -this.lineLen, this.lineLen, this.lineLen);
        line(this.lineLen, -this.lineLen, -this.lineLen, this.lineLen);
        pop();
    }

    this.onClick = function () {
        if (this.closing || dist(this.x + this.w / 2 - this.lineOffset, this.y - this.h / 2 + this.lineOffset, mouseX, mouseY) < this.lineLen * 2) {
            this.closing = true;
            return;
        }
        if (id == "prevsoln") {
            if (playingPrevSoln) {
                loadDailyBoard(0);

                this.closing = true;
                playingPrevSoln = false;
            } else {
                loadDailyBoard(-1); //yesterday's board

                loadStrings(`boards/solutions${boardSize}.txt`, lines => {
                    const rows = lines.filter(line => line.length > 0);
                    replayMoves = rows[mod(daysSinceEpoch() - 1, rows.length)].trim().split(' ');
                });

                this.closing = true;
                playingPrevSoln = true;
                replayStartFrame = frameCount + 90; //delay by 1.5 seconds
                replayIndex = 0;
            }
            resetVars();
        }


        this.buttons.forEach(button => {
            button.click();
        });
    }
}

function resetVars() {
    fadingTexts = [];
    rot = 0;
    wordsFound = [];
    score = 0;
    moves = 20;
    movesMade = [];
}