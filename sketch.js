let tileSize;
let board = [];
let rot = 0; //how much we've rotated a rot or col
let dict;
let wordsFound = [];
let score = 0;

function preload() {
    dict = loadStrings("WordleWords.txt")
}

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);

    tileSize = height / 16 + width / 32;

    //generate random characters

    // for(let r = 0; r < 5; r++) {
    //     board[r] = [];
    //     for(let c = 0; c < 5; c++) {
    //         board[r][c] = String.fromCharCode(parseInt(random(65, 91)));
    //     }
    // }

    //generate five words and scramble
    let words = [];

    for (let i = 0; i < 5; i++) {
        words[i] = dict[Math.floor(random(0, dict.length))].shuffle().toUpperCase();
    }

    for (let r = 0; r < 5; r++) {
        board[r] = [];
        for (let c = 0; c < 5; c++) {
            board[r][c] = new Tile(r, c, words[r].split("")[c]);
        }
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
    background(51);

    fill(0);
    noStroke();;
    textFont("Trebuchet MS");
    textSize(70);
    textAlign(CENTER, CENTER);
    text("SCORE: " + score, width / 2, height / 8);

    textFont("Arial");
    stroke(0);
    strokeWeight(10);
    noFill();
    rectMode(CENTER);
    rect(width / 2, height / 2, tileSize * 5, tileSize * 5, tileSize / 4);

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            board[r][c].show();
            board[r][c].update();
        }
    }

    if (touchStartX != -1 && touchStartY != -1) {
        if (Math.abs(mouseX - touchStartX) > Math.abs(mouseY - touchStartY)) {
            if (parseInt((mouseX - touchStartX) / tileSize) - rot != 0) {
                rotateRow(selectedRow, parseInt((mouseX - touchStartX) / tileSize) - rot);
                rot += parseInt((mouseX - touchStartX) / tileSize) - rot;
            }
        } else {
            if (parseInt((mouseY - touchStartY) / tileSize) - rot != 0) {
                rotateCol(selectedCol, parseInt((mouseY - touchStartY) / tileSize) - rot);
                rot += parseInt((mouseY - touchStartY) / tileSize) - rot;
            }
        }
    }
    checkWords();

    // text("fps: " + Math.floor(frameRate()), width / 2, height / 8);
}


function rotateRow(row, n) {
    // let dir = n / Math.abs(n);
    n %= 5;
    newRow = [];
    for (let i = 0; i < 5; i++) {
        let c = i - n;
        if (c < 0) {
            c += 5;
        }
        c %= 5;
        // newRow[i] = board[row][c];
        newRow[i] = board[row][c];
    }
    for (let i = 0; i < 5; i++) {
        board[row][i] = newRow[i];
        board[row][i].move(row, i);
    }
}


function rotateCol(col, n) {
    // let dir = n / Math.abs(n);
    n %= 5;
    newCol = [];
    for (let i = 0; i < 5; i++) {
        let r = i - n;
        if (r < 0) {
            r += 5;
        }
        r %= 5;
        newCol[i] = board[r][col];
    }
    for (let i = 0; i < 5; i++) {
        board[i][col] = newCol[i];
        board[i][col].move(i, col);
    }
}


let touchStartX = -1;
let touchStartY = -1;
let selectedRow = -1;
let selectedCol = -1;

function touchStarted() {
    selectedRow = parseInt((mouseY - height / 2 + tileSize * 2 + tileSize / 2) / tileSize);
    selectedCol = parseInt((mouseX - width / 2 + tileSize * 2 + tileSize / 2) / tileSize);
    fill(255);
    if (selectedRow >= 0 && selectedRow < 5 && selectedCol >= 0 && selectedCol < 5) {
        if (touchStartX == -1 && touchStartY == -1) {
            touchStartX = mouseX;
            touchStartY = mouseY;
        }
    }
    return false;
}

function touchEnded() {
    touchStartX = -1;
    touchStartY = -1;
    rot = 0;
    return false;
}

function touchMoved() {
    return false;
}


function checkWords() {
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            board[r][c].highlight = false;
        }
    }
    for (let r = 0; r < 5; r++) {
        let str = "";
        let revStr = "";
        for (let c = 0; c < 5; c++) {
            str += board[r][c].s;
            revStr += board[r][4 - c].s;
        }
        str = str.toLowerCase();
        revStr = revStr.toLowerCase();
        for (let c = 0; c < 5; c++) {
            if (dict.includes(str) && !wordsFound.includes(str)) {
                board[r][c].highlightDur = 180;
            }
            if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
                board[r][c].highlightDur = 180;
            }
        }
        if (dict.includes(str) && !wordsFound.includes(str)) {
            wordsFound.push(str);
            score += 100;
        }
        if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
            wordsFound.push(revStr);
            score += 100;
        }
    }

    for (let c = 0; c < 5; c++) {
        let str = "";
        let revStr = "";
        for (let r = 0; r < 5; r++) {
            str += board[r][c].s;
            revStr += board[4 - r][c].s;
        }
        str = str.toLowerCase();
        revStr = revStr.toLowerCase();
        for (let r = 0; r < 5; r++) {
            if (dict.includes(str) && !wordsFound.includes(str)) {
                board[r][c].highlightDur = 180;
            }
            if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
                board[r][c].highlightDur = 180;
            }
        }
        if (dict.includes(str) && !wordsFound.includes(str)) {
            wordsFound.push(str);
            score += 100;
        }
        if (dict.includes(revStr) && !wordsFound.includes(revStr)) {
            wordsFound.push(revStr);
            score += 100;
        }
    }
}

