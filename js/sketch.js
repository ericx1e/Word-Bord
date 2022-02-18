let boardSize = 5;
const API_URL = "http://ec2-18-208-144-154.compute-1.amazonaws.com/api/v1";

let firstLoad = true;

let tileSize;
let board = [];
let buttons = [];
let rot = 0; //how much we've rotated a rot or col
let dict;
let boards;
let wordsFound = [];
let movesMade = [];
let score = 0;
let scorePulse = 0;
let movesPulse = 0;
let fadingTexts = [];
let moves = 50;
let rotatingRows = false;
let rotatingCols = false;
let isPopup = false;
let popup;
let days2022 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let boardCreated = false;
// let screenFade = 0;
// let fa;

//settings
let darkMode = false;
let darkModeColor = 0;

function preload() {
}

function createBoard() {
    tileSize = height / 18 + width / 36 * 5 / 5;
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
}

function setup() {
    boardCreated = false;
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);
    if (firstLoad) {
        popup = new Popup("welcome");
        firstLoad = false;
    }
    noLoop();
    dict = loadStrings("dictionaries/words" + boardSize + ".txt");
    createBoard()
    font = loadFont("Ubuntu/Ubuntu-Light.ttf");
    font2 = loadFont("Ubuntu/Ubuntu-Regular.ttf");
    icons = loadFont("fa.otf");

    buttons.push(new Button(width - (width / 30 + height / 30), height - (width / 30 + height / 30), width / 40, "settings"));
    buttons.push(new Button(width - 2 * (width / 30 + height / 30), height - (width / 30 + height / 30), width / 40, "undo"))

    fetch(`${API_URL}/leaderboard`, {
        method: 'GET'
    }).then(response => response.json()).then(data => {
        console.log(data.length);
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
            console.log(data.name);
        }
    })

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

    // if (isPopup) {
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
    textSize(tileSize / 2 + scorePulse);
    if (scorePulse > 0) {
        scorePulse -= 0.7;
    }
    textAlign(CENTER, CENTER);
    text("SCORE: " + score, width / 2, height * 13.5 / 16);
    textSize(tileSize / 2 + movesPulse);
    if (movesPulse > 0) {
        movesPulse -= 0.5;
    }
    textAlign(CENTER, CENTER);
    text("MOVES: " + moves, width / 2, height * 15 / 16);

    textSize(tileSize);
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




    // text("fps: " + Math.floor(frameRate()), width / 2, height / 8);

    // for(let i = 0; i < fadingTexts.length; i++) {
    //     fadingTexts[0].show();
    //     if(fadingText[0].life > 
    //     if(fadingTexts[0].life < 0) {
    //         fadingTexts.splice(0, 1);
    //     }
    // }

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

    if (isPopup) {
        popup.show();
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
    if (isPopup) {
        popup.onClick();
        return false;
    }
    buttons.forEach(button => {
        button.update();
    });
    selectedRow = parseInt((mouseY - height / 2 + tileSize * (boardSize - 1) / 2 + tileSize / 2) / tileSize);
    selectedCol = parseInt((mouseX - width / 2 + tileSize * (boardSize - 1) / 2 + tileSize / 2) / tileSize);
    if (selectedRow >= 0 && selectedRow < boardSize && selectedCol >= 0 && selectedCol < boardSize) {
        if (moves <= 0) {
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
        fetch(`${API_URL}/leaderboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "TEST", // TODO: change this to a variable
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
            } else {
                console.log("neet");
            }
        })
        return false;
    }
    let _found = checkWords();
    if (rot % boardSize != 0) {
        moves--;
        movesPulse = 3;
        if (rotatingRows) {
            movesMade.push({ dir: "row", i: selectedRow, n: rot % 5, found: _found });
        } else {
            movesMade.push({ dir: "col", i: selectedCol, n: rot % 5, found: _found });
        }
    }
    touchStartX = -1;
    touchStartY = -1;
    rot = 0;
    rotatingRows = false;
    rotatingCols = false;
    return false;
}

function touchMoved() {
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
    console.log("wjat");
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