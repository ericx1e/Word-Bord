const API_URL = "https://word-bord-api.herokuapp.com/api/v1";
const days2022 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const TOTAL_MOVES = 20;

let boardSize = 4;
let firstLoad = true;
let tileSize;
let board = [];
let buttons = [];
let rot = 0; //how much we'veg rotated a rot or col
let dict;
let wordsFound = [];
let movesMade = [];
let score = 0;
let scorePulse = 0;
let movesPulse = 0;
let fadingTexts = [];
let moves = TOTAL_MOVES;
let rotatingRows = false;
let rotatingCols = false;
let popup;
let boardCreated = false;
let scoreSent = false;
let nameInputted = false;
let minLeaderboardScore;
let numLeaderboardScores;
let playingPrevSoln = false;
let replayStartFrame;
let replayMoves;
// let screenFade = 0;
// let fa;

//settings
let darkMode = false;
let darkModeColor = 0;

let showFound = true;

//sounds
let pointSound;
let bigPointSound;

function preload() {
    // pointSound = loadSound("sounds/mixkit-happy-bell-alert-601.wav");
    // bigPointSound = loadSound("sounds/mixkit-achievement-bell-600.wav");
    font = loadFont("Ubuntu/Ubuntu-Light.ttf");
    font2 = loadFont("Ubuntu/Ubuntu-Regular.ttf");
    icons = loadFont("fa.otf");
}

function createBoard() {
    setTileSize();
    fetch(`${API_URL}/board/${boardSize}`, {
        method: 'GET'
    }).then(response => response.json()).then(data => {
        // generate from API response
        for (let r = 0; r < boardSize; r++) {
            board[r] = [];
            for (let c = 0; c < boardSize; c++) {
                board[r][c] = new Tile(r, c, data[r][c].toUpperCase());
            }
        }

        checkWords();
        boardCreated = true;
        loop();
    })

    fetch(`${API_URL}/leaderboard`, { //get the minimum leaderboard score on load 
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
            numLeaderboardScores = data.length;
            if (numLeaderboardScores > 0) {
                minLeaderboardScore = data[data.length - 1].score;
            }
        }
    })
}

function setTileSize() {
    tileSize = height / 15 + width / 36 * 5 / boardSize;
}

function windowResized() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);

    setTileSize();

    if (popup) {
        if (popup.links) {
            popup.links.forEach(link => {
                link.remove();
            });
            popup.links = [];
        }
        popup = new Popup(popup.id);
        popup.x = width / 2;
        popup.y = height / 2;
    }

    createButtons();
}

function setup() {
    boardCreated = false;
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);
    if (firstLoad) {
        // popup = new Popup("welcome");
        firstLoad = false;
    }
    noLoop();
    dict = loadStrings("dictionaries/words" + boardSize + ".txt");
    createBoard()

    createButtons();



    // dayIndex = parseInt(random(0, 365*2));
    // console.log(dayIndex);

    //generate random characters

    // for(let r = 0; r < 5; r++) {
    //     board[r] = [];
    //     for(let c = 0; c < 5; c++) {
    //         board[r][c] = String.fromCharCode(parseInt(random(65, 91)));
    //     }
    // }
}

function createButtons() {
    buttons = [];

    let shift = width / 30 + height / 30;
    let size = shift / 2;
    if (width > height) {
        buttons.push(new Button(shift, height - shift, size, "info"));
        buttons.push(new Button(2 * shift, height - shift, size, "prevsoln"));
        buttons.push(new Button(width - shift, height - shift, size, "settings"));
        buttons.push(new Button(width - 2 * shift, height - shift, size, "undo"));
        buttons.push(new Button(width - 3 * shift, height - shift, size, "reset"));
        buttons.push(new Button(width - 4 * shift, height - shift, size, "leaderboard"));
    } else {
        shift *= 1.15;
        size *= 1.25;
        buttons.push(new Button(shift, height - shift, size, "info"));
        buttons.push(new Button(2 * shift, height - shift, size, "prevsoln"));
        buttons.push(new Button(width - shift, height - shift, size, "settings"));
        buttons.push(new Button(width - 2 * shift, height - shift, size, "undo"));
        buttons.push(new Button(width - shift, height - 2 * shift, size, "reset"));
        buttons.push(new Button(width - 2 * shift, height - 2 * shift, size, "leaderboard"));
    }
}

String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function draw() {
    // console.log(frameRate());
    if (!boardCreated) {
        // background(255);
        // textSize(100);
        // fill(0);
        // noStroke();
        // textAlign(CENTER, CENTER);
        // text("LOADING", width/2, height/2);

        return;
    }
    // if(board[0][0] == undefined) {
    //     return;
    // }

    // if (popup) {
    //     background(255 - darkModeColor);
    // } else {
    //     rectMode(CORNER);
    //     fill(255 - darkModeColor, 100);
    //     rect(0, 0, width, height);
    // }
    background(255 - darkModeColor);

    if (darkMode) {
        darkModeColor = lerp(darkModeColor, 215, 0.1);
    } else {
        darkModeColor = lerp(darkModeColor, 0, 0.1);
    }

    fill(0 + darkModeColor);
    noStroke();
    textFont(font);
    textSize(tileSize / 2.5 + scorePulse);
    if (scorePulse > 0) {
        scorePulse -= 0.7;
    }
    textAlign(CENTER, CENTER);
    text("SCORE: " + score, width / 2, height * 13.5 / 16);
    textSize(tileSize / 2.5 + movesPulse);
    if (movesPulse > 0) {
        movesPulse -= 0.5;
    }
    textAlign(CENTER, CENTER);
    text("MOVES: " + moves, width / 2, height * 15 / 16);

    textSize(tileSize * 0.9);
    text("WORD BORD", width / 2, height / 8);

    textFont("Arial");
    stroke(0);
    strokeWeight(10);
    noFill();
    rectMode(CENTER);
    // rect(width / 2, height / 2, tileSize * 5, tileSize * 5, tileSize / 4);

    buttons.forEach(button => {
        button.show();
    });

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            board[r][c].show();
            board[r][c].update();
        }
    }

    if (touchStartX != -1 && touchStartY != -1) {
        if (Math.abs(mouseX - touchStartX) > Math.abs(mouseY - touchStartY)) {
            if (parseInt((mouseX - touchStartX) / tileSize) - rot != 0 && !rotatingCols) {
                rotatingRows = true;
                rotateRow(selectedRow, parseInt((mouseX - touchStartX) / tileSize) - rot);
                rot += parseInt((mouseX - touchStartX) / tileSize) - rot;
            }
        } else {
            if (parseInt((mouseY - touchStartY) / tileSize) - rot != 0 && !rotatingRows) {
                rotatingCols = true;
                rotateCol(selectedCol, parseInt((mouseY - touchStartY) / tileSize) - rot);
                rot += parseInt((mouseY - touchStartY) / tileSize) - rot;
            }
        }
    }



    fill(0);

    for (let i = 0; i < fadingTexts.length; i++) {
        fadingTexts[i].show();
        if (fadingTexts[i].life > 150) {
            break;
        }
        if (fadingTexts[i].life < 0) {
            fadingTexts.splice(i, 1);
            i--;
        }
    }

    if (showFound && width > height) { //no good way to list words on small windows and mobile
        fill(darkModeColor);
        textAlign(CENTER, TOP);
        let size = height / 30;
        textFont(font);
        textSize(size);
        strokeWeight(size / 30); //stroke for a bold effect
        stroke(darkModeColor);
        text("Found:", width - width / 7, height / 9 - size);
        noStroke();
        // size *= 0.8;
        textSize(size);
        // for (let i = 0; i < wordsFound.length; i++) {
        //     //writes two words per row
        //     text(wordsFound[i], width - width / 7 - 1.5 * size + 3 * size * (i % 2), height / 9 + Math.floor(i / 2) * size);
        // }
        for (let i = 0; i < movesMade.length; i++) {
            let tx = "";
            tx += join(movesMade[i].found, "\t");
            // for (word in movesMade[i].found) {
            //     tx.join(word;
            // }
            text(tx, width - width / 7, height / 9 + i * size);
        }
    }

    if (playingPrevSoln) {
        updateReplay();
    }

    if (popup) {
        popup.show();
    }
}

let replayIndex = 0; //which move the replay is on
let replaySpeed = 40; //frames that pass between replay moves

function updateReplay() {
    if (replayIndex >= TOTAL_MOVES) {
        return;
    }
    if ((frameCount - replayStartFrame) == replaySpeed) {
        replayStartFrame += replaySpeed;
        let a = parseInt(replayMoves[replayIndex * 3]);
        let i = parseInt(replayMoves[replayIndex * 3 + 1]);
        let n = parseInt(replayMoves[replayIndex * 3 + 2]);
        a == 0 ? rotateRow(i, n) : rotateCol(i, n);
        let _found = checkWords();
        moves--;
        movesPulse = 3;
        if (a == 0) {
            movesMade.push({ dir: "row", i: selectedRow, n: rot % boardSize, found: _found });
        } else {
            movesMade.push({ dir: "col", i: selectedCol, n: rot % boardSize, found: _found });
        }
        replayIndex++;
    }
}

function rotateRow(row, n) {
    // let dir = n / Math.abs(n);
    n %= boardSize;
    newRow = [];
    for (let i = 0; i < boardSize; i++) {
        let c = i - n;
        if (c < 0) {
            c += boardSize;
        }
        c %= boardSize;
        // newRow[i] = board[row][c];
        newRow[i] = board[row][c];
    }
    for (let i = 0; i < boardSize; i++) {
        board[row][i] = newRow[i];
        board[row][i].move(row, i);
    }
}


function rotateCol(col, n) {
    // let dir = n / Math.abs(n);
    n %= boardSize;
    newCol = [];
    for (let i = 0; i < boardSize; i++) {
        let r = i - n;
        if (r < 0) {
            r += boardSize;
        }
        r %= boardSize;
        newCol[i] = board[r][col];
    }
    for (let i = 0; i < boardSize; i++) {
        board[i][col] = newCol[i];
        board[i][col].move(i, col);
    }
}


let touchStartX = -1;
let touchStartY = -1;
let selectedRow = -1;
let selectedCol = -1;

function touchStarted() {
    if (popup) {
        popup.onClick();
        return false;
    }

    buttons.forEach(button => {
        button.update();
    });

    if (playingPrevSoln) {
        return false;
    }

    selectedRow = parseInt((mouseY - height / 2 + tileSize * (boardSize - 1) / 2 + tileSize / 2) / tileSize);
    selectedCol = parseInt((mouseX - width / 2 + tileSize * (boardSize - 1) / 2 + tileSize / 2) / tileSize);
    if (selectedRow >= 0 && selectedRow < boardSize && selectedCol >= 0 && selectedCol < boardSize) {
        if (moves <= 0) {
            if (!scoreSent) {
                if (numLeaderboardScores < 10 || score > minLeaderboardScore) {
                    popup = new Popup("name");
                    return;
                }
            }
            popup = new Popup("gameover");
            return false;
        }
        if (touchStartX == -1 && touchStartY == -1) {
            touchStartX = mouseX;
            touchStartY = mouseY;
        }
    }
    return false;
}

function touchEnded() {
    if (moves <= 0) {
        return;
    }
    if (rot % boardSize != 0) {
        let _found = checkWords();
        moves--;
        movesPulse = 3;
        if (rotatingRows) {
            movesMade.push({ dir: "row", i: selectedRow, n: rot % boardSize, found: _found });
        } else {
            movesMade.push({ dir: "col", i: selectedCol, n: rot % boardSize, found: _found });
        }
        // fetch(`${API_URL}/checkgame`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         name: 'buh',
        //         score: score,
        //         boardSize: boardSize,
        //         moves: movesMade
        //     })
        // }).then(response => response.json()).then(data => {
        //     console.log(data);
        // })
    }
    touchStartX = -1;
    touchStartY = -1;
    rot = 0;
    rotatingRows = false;
    rotatingCols = false;
    return false;
}

function touchMoved() { //prevent dragging the screen on mobile
    return false;
}


function checkWords() {
    let result = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            board[r][c].highlight = false;
        }
    }
    for (let r = 0; r < boardSize; r++) {
        let str = "";
        let revStr = "";
        for (let c = 0; c < boardSize; c++) {
            str += board[r][c].s;
            revStr += board[r][boardSize - 1 - c].s;
        }
        str = str.toLowerCase();
        revStr = revStr.toLowerCase();
        for (let c = 0; c < boardSize; c++) {
            if (dict.includes(str) && !wordsFound.includes(str)) {
                board[r][c].highlightDur = 180;
            }
            if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
                board[r][c].highlightDur = 180;
            }
        }
        if (dict.includes(str) && !wordsFound.includes(str)) {
            scoreWord(str);
            result.push(str);
        }
        if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
            scoreWord(revStr);
            result.push(revStr);
        }
    }

    for (let c = 0; c < boardSize; c++) {
        let str = "";
        let revStr = "";
        for (let r = 0; r < boardSize; r++) {
            str += board[r][c].s;
            revStr += board[boardSize - 1 - r][c].s;
        }
        str = str.toLowerCase();
        revStr = revStr.toLowerCase();
        for (let r = 0; r < boardSize; r++) {
            if (dict.includes(str) && !wordsFound.includes(str)) {
                board[r][c].highlightDur = 180;
            }
            if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
                board[r][c].highlightDur = 180;
            }
        }
        if (dict.includes(str) && !wordsFound.includes(str)) {
            scoreWord(str);
            result.push(str);
        }
        if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
            scoreWord(revStr);
            result.push(revStr);
        }
    }
    return result;
}

function scoreWord(str) {
    wordsFound.push(str);
    // fadingTexts.push(new FadingText(width / 2, height / 8, "+100"));
    score += 100;
    if (score % 1000 == 0) {
        // bigPointSound.play();
    } else {
        // pointSound.play();
    }
    scorePulse = 8;
    if (width > height) {
        fadingTexts.push(new FadingText(width / 4, height / 2, str.toUpperCase()));
    } else {
        fadingTexts.push(new FadingText(width / 2, height / 4, str.toUpperCase()));
    }
}

function keyPressed() {
}

function undo() {
    if (movesMade.length > 0) {
        lastMove = movesMade.pop();
        if (lastMove.dir == "row") {
            rotateRow(lastMove.i, -lastMove.n);
            moves++;
        }
        if (lastMove.dir == "col") {
            rotateCol(lastMove.i, -lastMove.n);
            moves++;
        }
        for (let i = 0; i < lastMove.found.length; i++) {
            wordsFound.pop();
            score -= 100;
        }
    }
}

function reset() {
    for (let i = 0; i < movesMade.length; i++) {
        undo();
        i--;
    }
    scoreSent = false;
    nameInputted = false;
}