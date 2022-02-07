let tileSize = 100;
let board = [];
let rot = 0; //how much we've rotated a rot or col
let dict;

function preload() {
    dict = loadStrings("WordleWords.txt")
}

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);

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
    stroke(0);
    strokeWeight(10);
    noFill();
    rectMode(CENTER);
    rect(width / 2, height / 2, tileSize * 5, tileSize * 5, tileSize / 4);

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            board[r][c].show();
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
}

function touchEnded() {
    touchStartX = -1;
    touchStartY = -1;
    rot = 0;
    checkWords();
}

function checkWords() {
    for (let r = 0; r < 5; r++) {
        let str = "";
        let revStr = "";
        for (let c = 0; c < 5; c++) {
            str += board[r][c];
            revStr += board[r][4 - c];
        }
        str = str.toLowerCase();
        revStr = revStr.toLowerCase();
        if (dict.includes(str)) {
            console.log(str);
        }
        if (dict.includes(revStr)) {
            console.log(revStr);
        }
    }

    for (let c = 0; c < 5; c++) {
        let str = "";
        let revStr = "";
        for (let r = 0; r < 5; r++) {
            str += board[r][c];
            revStr += board[r][4 - c];
        }
        str = str.toLowerCase();
        revStr = revStr.toLowerCase();
        if (dict.includes(str)) {
            console.log(str);
        }
        if (dict.includes(revStr)) {
            console.log(revStr);
        }
    }
}

