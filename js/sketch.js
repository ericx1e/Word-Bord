const TOTAL_MOVES = 20;
const EPOCH_UTC = Date.UTC(2024, 0, 1); //day counter starts at 2024-01-01, matching the original API

//doodle palette: [light theme, dark theme]
const THEME = {
    paper: ['#fbf5e9', '#282c31'],   //background
    ink: ['#3a352e', '#e9e4d8'],     //text and outlines
    tile: ['#fffdf5', '#343a41'],    //tile and popup fill
    accent: ['#ffd95e', '#dcb945'],  //highlighter yellow
};
let paperC, inkC, tileC, accentC; //current frame's colors, updated in draw()
let dotsLayer; //pre-rendered notebook-dot background, rebuilt on resize
let idleFrames = 0; //frames since anything last animated

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
    //string font names use the browser's native (glyph-cached) text rendering,
    //which is far faster than p5's per-glyph path tracing of loaded fonts
    font = "Patrick Hand";
    font2 = font;
    if (document.fonts) {
        document.fonts.load("16px 'Patrick Hand'"); //the @font-face in index.html
    }
}

function createBoard() {
    setTileSize();
    loadDailyBoard(0, () => {
        restoreOrInitGame();
        boardCreated = true;
        loop();
    });
}

function daysSinceEpoch() {
    //boards roll over at midnight Eastern, matching the original API
    const ny = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    const [y, m, d] = ny.split('-').map(Number);
    return Math.round((Date.UTC(y, m - 1, d) - EPOCH_UTC) / 86400000);
}

function storageGet(key, def) {
    try {
        const v = JSON.parse(localStorage.getItem(key));
        return v === null || v === undefined ? def : v;
    } catch (e) {
        return def;
    }
}

function storageSet(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { }
}

function gameKey() {
    return "wordbord-game-" + boardSize;
}

function saveSettings() {
    storageSet("wordbord-settings", { darkMode: darkMode, boardSize: boardSize, showFound: showFound });
}

function loadSettings() {
    const s = storageGet("wordbord-settings", null);
    if (s) {
        darkMode = !!s.darkMode;
        showFound = s.showFound !== false;
        boardSize = s.boardSize == 5 ? 5 : 4;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        darkMode = true; //first visit: follow the system theme
    }
    if (darkMode) {
        darkModeColor = 215; //skip the light-to-dark transition on load
    }
}

//time until the next daily bord (midnight Eastern)
function timeToNextBord() {
    const [h, m, s] = new Date().toLocaleTimeString('en-GB', { timeZone: 'America/New_York', hour12: false }).split(':').map(Number);
    const secs = 86400 - (h * 3600 + m * 60 + s);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return hrs > 0 ? hrs + "h " + mins + "m" : mins + "m " + (secs % 60) + "s";
}

function saveGame() {
    const prev = storageGet(gameKey(), {});
    storageSet(gameKey(), {
        day: daysSinceEpoch(),
        score: score,
        moves: moves,
        wordsFound: wordsFound,
        movesMade: movesMade,
        counted: prev.day === daysSinceEpoch() ? !!prev.counted : false, //stats already tallied today
    });
}

//restore today's saved game if there is one, otherwise start fresh
function restoreOrInitGame() {
    const save = storageGet(gameKey(), null);
    if (save && save.day === daysSinceEpoch() && Array.isArray(save.movesMade)) {
        save.movesMade.forEach(m => m.dir === "row" ? rotateRow(m.i, m.n) : rotateCol(m.i, m.n));
        movesMade = save.movesMade;
        wordsFound = save.wordsFound || [];
        score = save.score || 0;
        moves = save.moves;
    } else {
        checkWords();
    }
}

//tally streak/best/games once per day, then pop the game over card
function onGameOver() {
    const today = daysSinceEpoch();
    const save = storageGet(gameKey(), {});
    const stats = storageGet("wordbord-stats", { streak: 0, lastDay: null, best: {}, games: 0 });
    if (!(save.day === today && save.counted)) {
        stats.games++;
        if (stats.lastDay !== today) {
            stats.streak = stats.lastDay === today - 1 ? stats.streak + 1 : 1;
            stats.lastDay = today;
        }
        save.counted = true;
        storageSet(gameKey(), save);
    }
    if ((stats.best[boardSize] || 0) < score) {
        stats.best[boardSize] = score;
    }
    storageSet("wordbord-stats", stats);

    setTimeout(() => {
        if (moves <= 0 && !popup) {
            popup = new Popup("gameover");
        }
    }, 1200); //let the last word's flash play out first
}

//finding several words with one spin earns a bonus
function awardCombo(_found) {
    if (_found.length < 2) {
        return 0;
    }
    const bonus = (_found.length - 1) * 100;
    score += bonus;
    scorePulse = 12;
    if (width > height) {
        fadingTexts.push(new FadingText(width / 4, height / 2 + height / 10, "combo x" + _found.length + "! +" + bonus, 1.6));
    } else {
        fadingTexts.push(new FadingText(width / 2, height / 4 + height / 10, "combo x" + _found.length + "! +" + bonus, 1.6));
    }
    return bonus;
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

//offset picks the day relative to today (0 = today, -1 = yesterday);
//the day index wraps around so boards cycle when the pre-generated set runs out
function loadDailyBoard(offset, done) {
    loadStrings(`boards/boards${boardSize}.txt`, lines => {
        const rows = lines.filter(line => line.length >= boardSize);
        const numBoards = Math.floor(rows.length / boardSize);
        const index = mod(daysSinceEpoch() + offset, numBoards);
        for (let r = 0; r < boardSize; r++) {
            board[r] = [];
            for (let c = 0; c < boardSize; c++) {
                board[r][c] = new Tile(r, c, rows[index * boardSize + r][c].toUpperCase());
            }
        }
        if (done) done();
    });
}

function setTileSize() {
    tileSize = height / 15 + width / 36 * 5 / boardSize;
}

function updateThemeColors() {
    const t = darkModeColor / 215;
    paperC = lerpColor(color(THEME.paper[0]), color(THEME.paper[1]), t);
    inkC = lerpColor(color(THEME.ink[0]), color(THEME.ink[1]), t);
    tileC = lerpColor(color(THEME.tile[0]), color(THEME.tile[1]), t);
    accentC = lerpColor(color(THEME.accent[0]), color(THEME.accent[1]), t);
}

function buildDotsLayer() {
    dotsLayer = createGraphics(width, height);
    dotsLayer.pixelDensity(1); //background texture doesn't need retina resolution
    dotsLayer.noStroke();
    dotsLayer.fill(128, 128, 128, 40);
    const gap = Math.max(30, (width + height) / 50);
    for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
            dotsLayer.circle(x, y, gap / 12);
        }
    }
}

function windowResized() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);
    idleFrames = 0; //the new canvas is blank, so repaint

    setTileSize();
    buildDotsLayer();

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
    //cap density: 3x phone screens otherwise push 2.25x the pixels for no visible gain
    pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);
    strokeJoin(ROUND);
    strokeCap(ROUND);
    buildDotsLayer();
    if (firstLoad) {
        // popup = new Popup("welcome");
        firstLoad = false;
        loadSettings();
    }
    noLoop();
    //wait for the dictionary before building the board so checkWords() sees a full word list
    dict = loadStrings("dictionaries/words" + boardSize + ".txt", () => createBoard());

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
    } else {
        shift *= 1.15;
        size *= 1.25;
        buttons.push(new Button(shift, height - shift, size, "info"));
        buttons.push(new Button(2 * shift, height - shift, size, "prevsoln"));
        buttons.push(new Button(width - shift, height - shift, size, "settings"));
        buttons.push(new Button(width - 2 * shift, height - shift, size, "undo"));
        buttons.push(new Button(width - shift, height - 2 * shift, size, "reset"));
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

//anything mid-animation? when false, frames can be skipped entirely
function isAnimating() {
    if (popup || playingPrevSoln || touchStartX != -1 || fadingTexts.length > 0) {
        return true;
    }
    if (scorePulse > 0 || movesPulse > 0) {
        return true;
    }
    if (Math.abs(darkModeColor - (darkMode ? 215 : 0)) > 0.5) {
        return true;
    }
    for (let b of buttons) {
        if (b.pulse > 0) {
            return true;
        }
    }
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const t = board[r][c];
            if (t.highlightDur > 0 ||
                Math.abs(t.x - (width / 2 + t.c * tileSize - (boardSize - 1) / 2 * tileSize)) > 0.3 ||
                Math.abs(t.y - (height / 2 + t.r * tileSize - (boardSize - 1) / 2 * tileSize)) > 0.3) {
                return true;
            }
        }
    }
    return false;
}

function draw() {
    // console.log(frameRate());
    if (!boardCreated) {
        return;
    }

    //skip rendering while nothing moves; one extra frame paints the settled state
    if (isAnimating()) {
        idleFrames = 0;
    } else if (++idleFrames > 1) {
        return;
    }

    if (darkMode) {
        darkModeColor = lerp(darkModeColor, 215, 0.1);
        if (215 - darkModeColor < 0.5) darkModeColor = 215;
    } else {
        darkModeColor = lerp(darkModeColor, 0, 0.1);
        if (darkModeColor < 0.5) darkModeColor = 0;
    }
    updateThemeColors();

    background(paperC);
    image(dotsLayer, 0, 0);

    fill(inkC);
    noStroke();
    textFont(font);
    textSize(tileSize / 2.5 + scorePulse);
    if (scorePulse > 0) {
        scorePulse -= 0.7;
    }
    textAlign(CENTER, CENTER);
    text("Score: " + score, width / 2, height * 13.5 / 16);
    textSize(tileSize / 2.5 + movesPulse);
    if (movesPulse > 0) {
        movesPulse -= 0.5;
    }
    textAlign(CENTER, CENTER);
    if (moves <= 3 && moves > 0 && !playingPrevSoln) {
        //running low: swipe a highlighter stripe behind the counter
        noStroke();
        fill(red(accentC), green(accentC), blue(accentC), 170);
        rectMode(CENTER);
        rect(width / 2, height * 15 / 16, textWidth("Moves: " + moves) * 1.25, tileSize / 3, tileSize / 12);
        fill(inkC);
    }
    text("Moves: " + moves, width / 2, height * 15 / 16);

    textSize(tileSize * 0.9);
    text("Word Bord", width / 2, height / 8);

    //hand-drawn highlighter underline beneath the title
    stroke(accentC);
    strokeWeight(tileSize / 14);
    noFill();
    const underW = tileSize * 3.6;
    const underY = height / 8 + tileSize * 0.58;
    beginShape();
    for (let i = 0; i <= 10; i++) {
        vertex(width / 2 - underW / 2 + underW * i / 10,
            underY + (noise(i * 3.7) - 0.5) * tileSize * 0.14);
    }
    endShape();

    rectMode(CENTER);

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
        const size = height / 32;
        const cx = width - width / 7;
        const top = height / 9;

        textFont(font);
        fill(inkC);
        noStroke();
        textAlign(CENTER, TOP);
        textSize(size * 1.25);
        text("Found: " + wordsFound.length, cx, top - size * 1.7);

        //marker underline, echoing the title
        stroke(accentC);
        strokeWeight(size / 4);
        line(cx - size * 2.3, top - size * 0.2, cx + size * 2.3, top - size * 0.2);
        noStroke();

        //one column while it fits, then two; oldest words collapse into "..."
        const lineH = size * 1.35;
        const rows = Math.max(1, Math.floor((height * 0.78 - top) / lineH));
        const colW = size * 5;
        let words = wordsFound;
        if (words.length > rows * 2) {
            words = wordsFound.slice(wordsFound.length - (rows * 2 - 1));
            words.unshift("...");
        }
        textSize(size);
        for (let i = 0; i < words.length; i++) {
            const col = Math.floor(i / rows);
            const x = cx + (words.length > rows ? (col - 0.5) * colW : 0);
            const y = top + size * 0.6 + (i % rows) * lineH;
            text(words[i], x, y);
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
        awardCombo(_found);
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
        let bonus = awardCombo(_found);
        if (rotatingRows) {
            movesMade.push({ dir: "row", i: selectedRow, n: rot % boardSize, found: _found, bonus: bonus });
        } else {
            movesMade.push({ dir: "col", i: selectedCol, n: rot % boardSize, found: _found, bonus: bonus });
        }
        saveGame();
        if (moves <= 0) {
            onGameOver();
        }
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
    //cmd/ctrl+z to undo
    if (keyCode === 90 && (keyIsDown(CONTROL) || keyIsDown(91) || keyIsDown(93))) {
        if (!playingPrevSoln && !popup) {
            undo();
        }
        return false;
    }
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
        score -= lastMove.bonus || 0;
        saveGame();
    }
}

function reset() {
    for (let i = 0; i < movesMade.length; i++) {
        undo();
        i--;
    }
}