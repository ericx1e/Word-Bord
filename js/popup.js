function Popup(id) {
    isPopup = true;
    this.x = width / 2;
    this.y = height * 3 / 2;
    this.w = height / 3 + width / 6;
    this.h = height * 7 / 10;
    this.lineLen = this.w / 80;
    this.closing = false;
    this.buttons = [];
    this.data;
    this.gotData = false;

    if (id == "settings") {
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, -this.h / 4, "dark mode"));
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, -this.h / 8, "board size"));
        this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, 0, "show found"));
        // this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, this.h / 8, "dark mode"));
        // this.buttons.push(new SlidingButton(this.x + this.w * 6 / 16, this.y, this.w, this.h / 4, "dark mode"));
    }
    else if (id == "leaderboard") {
        fetch(`${API_URL}/leaderboard`, {
            method: 'GET'
        }).then(response => response.json()).then(data => {
            /*
            On success:
            [
                {
                    name: NAME,
                    score: score
                }
            ]
    
            On err:
            {
                err: "ASDF"
            }
            */


            if (data.err) {
                console.log(data.err);
            } else {
                this.data = data;
                this.gotData = true;
            }
        })
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
        for (let i = this.w / 25; i > 0; i--) {
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
                text("Click and drag to rotate rows and columns to create words\n\nChoose a 4x4 or 5x5 bord in the settings\n\nWords can be formed regularly or backwards on any row or column\n\nScore as many points as possible in 20 moves\n\nCome back every day for a new Word Bord!\n\n\n\nMade by Eric Xie", this.x, this.y - this.h / 3, this.w * 9 / 10);
                break;
            case "gameover":
                text(`Out of moves!\n\n\nYou scored ${score} points \n\nRestart to try again or come back tomorrow for a new Word Bord`, this.x, this.y - this.h / 4, this.w * 9 / 10);
                break;
            case "settings":
                text("Settings", this.x, this.y - this.h / 2.5, this.w * 9 / 10);
                break;
            case "leaderboard":
                if (!this.gotData) {
                    text("Error getting scores", this.x, this.y);
                } else {
                    text("Today's Top Scores", this.x, this.y - this.h / 2.5, this.w * 9 / 10);
                    for (let i = 0; i < this.data.length; i++) {
                        textAlign(LEFT, CENTER);
                        text(this.data[i].name, this.x - this.w * 9 / 20, this.y - this.h / 3 + this.h / 13 * i);
                        textAlign(RIGHT, CENTER);
                        text(this.data[i].score, this.x + this.w * 9 / 20, this.y - this.h / 3 + this.h / 13 * i);
                    }
                }
                break;
            case "name":
                text("New High Score!\n\n\nClick to enter your name", this.x, this.y - this.h / 2.5, this.w * 9 / 10);
                break;
        }

        this.buttons.forEach(button => {
            button.show();
            button.update();
        });

        push();
        stroke(0 + darkModeColor);
        strokeWeight(1);
        translate(this.x + this.w * 7 / 16, this.y - this.h * 7 / 16);
        line(-this.lineLen, -this.lineLen, this.lineLen, this.lineLen);
        line(this.lineLen, -this.lineLen, -this.lineLen, this.lineLen);
        pop();
    }

    this.onClick = function () {
        if (dist(this.x + this.w * 7 / 16, this.y - this.h * 7 / 16, mouseX, mouseY) < this.lineLen * 2) {
            this.closing = true;
            return;
        }
        if (id == "name" && !scoreSent) {

            let name = prompt("Enter your name (6 characters max)");
            fetch(`${API_URL}/leaderboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    score: score,
                    boardSize: boardSize,
                    moves: movesMade
                })
            }).then(response => response.json()).then(data => {
                // do something with the data
                /*
                ON SUCCESS
                {
                    name: "TEST",
                    score: 0
                }
    
                ON FAILURE
                {
                    err: "ERROR MESSAGE"
                }
    
                if (data.err) // if it's not null
                    // ERROR HANDLING
                else // display score
                */
                if (data.err) {
                    console.log(data.err);
                    if (data.err == "Error: Name not allowed.") {
                        name = prompt("Invalid name");
                    } else {
                        //invalid board so we just close everything lol
                        scoreSent = true;
                        this.closing = true;
                    }
                } else {
                    scoreSent = true;
                    this.closing = true;
                }
            })
        }
        this.buttons.forEach(button => {
            button.click();
        });
    }
}