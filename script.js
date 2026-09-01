const ASSET_PATHS = {
    soulRed: "soul_default_red.png",
    soulBlue: "soul_default_blue.png",
    btnFight1: "fight_1.png",
    btnFight2: "fight_2.png",
    btnAct1: "act_1.png",
    btnAct2: "act_2.png",
    btnItem1: "item_1.png",
    btnItem2: "item_2.png",
    btnMercy1: "mercy_1.png",
    btnMercy2: "mercy_2.png",
    hpLabel: "hpLabel.png",
    krLabel: "krLabel.png",
    bg: "bg1.png",
    uiTest: "UI_test.png"
};

const images = {};
for (const [key, path] of Object.entries(ASSET_PATHS)) {
    images[key] = new Image();
    images[key].src = path;
}

let battleSetting = { turn: "player", ATKcount: 1 };
let timer = 0;
let soul = { x: 0, y: 80, angle: 90, color: "red" };
let player = { name: "chara", lv: 19, maxHp: 92, nowHp: 92, karma: 0, enableKarma: false };
let hpBarLength = 92;
let board = [
    {x: 0, y: 80, angle: 0, left: 65, bottom: 65, right: 65, top: 65},
    {x: 0, y: 80, angle: 0, left: 20, bottom: 20, right: 20, top: 20},
    {x: 0, y: 80, angle: 0, left: 20, bottom: 20, right: 90, top: 20},
    {x: 0, y: 80, angle: 0, left: 20, bottom: 20, right: 20, top: 20},
    {x: 0, y: 80, angle: 0, left: 90, bottom: 20, right: 20, top: 20},
    {x: 0, y: -80, angle: 0, left: 40, bottom: 40, right: 40, top: 40},
    {x: 0, y: 0, angle: 0, left: 8, bottom: 80, right: 8, top: 80}
];    
let soul_g = 0;
let inBoard = [];
let addAngles = [];
let isGrounded = false;
const TextDB = document.getElementById("TextDB");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const keys = {};
document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});
document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});
const mouse = {x: 0, y: 0};
document.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (event.clientX - rect.left) * scaleX;
    mouse.y = (event.clientY - rect.top) * scaleY;
});

const dialog = "Hello, World!";
let typewriterIndex = 0;
let typewriterTimer = 0;
const typewriterSpeed = 3;

if (battleSetting.turn == "player") {
    playerTurnProcessing();
}

function loop(){
    timer++;
    const size = 80;
    for (let i = 1; i < 5; i++) {
        board[i].x = -size * Math.sin((i * 90 + timer) * Math.PI / 180);
        board[i].y = 80 - size * Math.cos((i * 90 + timer) * Math.PI / 180);
        board[i].angle = timer;
    }
    
    typewriterTimer++;
    if (typewriterTimer >= typewriterSpeed) {
        typewriterTimer = 0;
        if (typewriterIndex < dialog.length) {
            typewriterIndex++;
        }
    }
    
    if (false) board[0].angle = timer;
    soulMoving();
    
    const r = collision(soul.x, soul.y);
    
    if(r)soul.x = r.x, soul.y = r.y;
    
    if (keys[2]) {
        soul.color = "blue";
        soul_g = 0;
    }
    if (keys[1]) {
        soul.color = "red";
    }
    if (keys[3]) {
        battleSetting.turn = "player";
    }
    
    draw();
    
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

function drawText(){
    ctx.font = "26px DeterminationMono";
    ctx.fillStyle = "white";
    const currentText = dialog.substring(0, typewriterIndex);
    ctx.fillText(currentText, -267, 55);
}

TextDB.textContent = battleSetting.turn;


function playerTurnProcessing() {
}

function soulMoving(){
    const speed = keys["x"] ? 1 : 2;
    if (soul.color === "red"){
        if (keys["ArrowRight"]) soul.x += speed;
        if (keys["ArrowLeft"]) soul.x -= speed;
        if (keys["ArrowUp"]) soul.y -= speed;
        if (keys["ArrowDown"]) soul.y += speed;
    } else if (soul.color === "blue"){
        const angle = (soul.angle - 90) * Math.PI / 180;
        const keyArray = ["ArrowUp",];
        const keyIndex = soul.angle / 90 - 1;
        const jumpKey = keyArray[keyIndex];
        if (keys["ArrowRight"]) soul.x += speed * Math.abs(Math.cos(angle));
        if (keys["ArrowLeft"]) soul.x -= speed * Math.abs(Math.cos(angle));
        if (keys["ArrowUp"]) soul.y -= speed * Math.abs(Math.sin(angle));
        if (keys["ArrowDown"]) soul.y += speed * Math.abs(Math.sin(angle));
        
        const isGrounded = groundedCheck();

        
        if (keys[jumpKey]) {
            if (isGrounded) soul_g = -5.2;
        } else {
            if (soul_g < -0.5) soul_g = -0.5;
        }
        
        soul.x += soul_g * Math.sin(angle);
        soul.y += soul_g * Math.cos(angle);
        if (!isGrounded) soul_g += 0.2;
    }
}

function groundedCheck() {
    for (let i = 0; i < addAngles.length; i++) {
        const difference = (addAngles[i] - soul.angle) % 360;
        if (difference > 130 && (360 - difference) > 130) {
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);

    drawBehindBoard();
    ctx.fillStyle = "white";
    drawBoard(6);
    ctx.fillStyle = "black";
    drawBoard(1);

    ctx.save();
    
    ctx.translate(soul.x, soul.y);
    ctx.rotate((soul.angle - 90) * Math.PI / 180);

const soulImg = (soul.color === "red") ? images.soulRed : images.soulBlue;
    drawImage(soulImg, 100, 100, 0.175, 0, 0);
    
    ctx.restore();
    
    ctx.globalAlpha = document.getElementById("test").value;
    drawImage(images.uiTest,images.uiTest.width, images.uiTest.height, 0.8, 0, 0);

    ctx.globalAlpha = 1;

    drawText();
}

function drawBehindBoard() {
    if(false)drawImage(images.bg, images.bg.width, images.bg.height, 1, 0, 0);
    drawImage(images.btnFight1, 110, 42, 1, -234, 214);
    drawImage(images.btnAct1, 110, 42, 1, -80, 214);
    drawImage(images.btnItem1, 110, 42, 1, 80, 214);
    drawImage(images.btnMercy1, 110, 42, 1, 234, 214);
    let cx = -65;
    if (player.enableKarma === false){
        cx = -45;
    } else {
        drawImage(images.krLabel, 23, 10, 1, cx + 20 + hpBarLength * 1.2, 170);
    }
    const normalizeHp = player.maxHp / hpBarLength * 1.2
    ctx.font = "15px Status";
    ctx.fillStyle = "white";
    ctx.fillText(player.name, -290, 178);
    ctx.fillText("lv", -189, 178);
    ctx.fillText(player.lv, -148, 178);
    ctx.fillText(player.nowHp, cx + 35 + hpBarLength, 178);
    let text = ctx.measureText("aaa");
    let x = 28 + cx + text.width + hpBarLength;
    ctx.fillText("/", x, 178);
    x += 23;
    ctx.fillText(player.maxHp, x, 178);
    ctx.fillStyle = "yellow";
    drawImage(images.hpLabel, 23, 10, 1, cx - 20, 170);

    ctx.fillRect(cx, 160,player.nowHp * normalizeHp , 20);
}

function drawBoard(size) {
    for (let i = 0; i < board.length; i++){
        const data = board[i];
        ctx.save();
        ctx.translate(data.x, data.y);
        ctx.rotate(data.angle * Math.PI / 180);
        
        const cx = -data.left - size;
        const cy = -data.top - size;
        ctx.fillRect(cx, cy, data.right + data.left + size * 2, data.top + data.bottom + size * 2);
        
        ctx.restore();
    }
}

function collision(input_x, input_y) {
    addAngles = [];
    let distance = Infinity;
    let boardIndex = 0;
    for(let i = 0; i < board.length; i++){
        const r = boardCollision(input_x, input_y, i, 8, 1);
        const length = Math.hypot(r.x - input_x, r.y - input_y);
        if(length === 0){
            return null;
        } else if(distance > length){
            boardIndex = i;
            distance = length;
        }
    }
    return boardCollision(input_x, input_y, boardIndex, 8, 1);
}


function boardCollision(input_x, input_y, index, size, type) {
    const borderWidth = size;
    const data = board[index];
    let rotate = rotate2D(input_x - data.x, input_y - data.y,  toRad(-data.angle));
    let x = rotate.rx;
    let y = rotate.ry;
    
    const left = data.right - borderWidth;
    const bottom = data.bottom - borderWidth;
    const right = -data.left + borderWidth;
    const top = -data.top + borderWidth;
    
    if (type === 2){
        let is_inside = (x >= -left && x <= -right && y >= top && y <= bottom);
        return is_inside;
    } else {
        if (x < right) {
            x = right;
            addAngles.push(data.angle + 360);
        }
        if (y < top) {
            y = top;
            addAngles.push(data.angle + 90);
        }
        if (x > left) {
            x = left;
            addAngles.push(data.angle + 180);
        }
        if (y > bottom) {
            y = bottom;
            addAngles.push(data.angle + 270);
        }
        rotate = rotate2D(x, y, toRad(data.angle));
        x = rotate.rx + data.x;
        y = rotate.ry + data.y;
        return {x, y};
    }
}

function rotate2D(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return {rx, ry};
}

function drawImage(name, width, height, size, x, y) {
    const imgWidth = width * size;
    const imgHeight = height * size;
    ctx.drawImage(
        name,
        x - imgWidth / 2,
        y - imgHeight / 2,
        imgWidth,
        imgHeight
    );
}

function easeOutSine(x) {
    return Math.sin(x * Math.PI / 2);
}

function toRad(deg) {
    return deg * Math.PI / 180;
}
