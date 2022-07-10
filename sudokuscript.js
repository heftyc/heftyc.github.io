let canvas = document.getElementById("myCanvas");
let context = canvas.getContext("2d");

let nums = [[0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0]];

let samples=[[[4,5,3,6,0,7,0,1,9],
            [0,7,1,3,0,2,4,6,8],
            [0,0,0,4,0,9,5,0,0],
            [1,0,5,0,0,0,7,8,0],
            [0,2,0,0,4,0,0,0,0],
            [0,0,0,7,0,0,0,2,1],
            [0,1,9,5,6,0,0,0,0],
            [0,0,0,1,0,0,8,0,0],
            [2,0,4,0,7,0,0,0,6]], 
            
           [[0,0,2,1,0,8,4,0,0],
            [5,0,0,0,0,0,0,7,0],
            [0,0,0,6,7,0,2,3,0],
            [0,0,0,0,8,0,1,0,0],
            [4,5,0,3,0,7,0,0,0],
            [0,8,7,0,0,0,0,4,0],
            [0,7,6,9,3,1,0,2,4],
            [3,0,0,0,0,0,0,1,6],
            [1,2,5,7,4,0,0,9,8]],
        
            [[2,9,0,0,0,5,0,0,0],
            [5,0,0,7,0,3,4,0,9],
            [0,0,0,9,0,8,5,6,1],
            [0,0,0,0,4,0,6,1,0],
            [9,0,0,8,0,0,0,0,7],
            [0,0,3,6,7,2,0,8,0],
            [6,4,0,0,5,0,8,0,0],
            [8,2,0,3,0,6,0,4,5],
            [3,0,5,2,0,0,1,0,0]]];

let squareX = null, squareY=null;


let sideDimension = 0;
let xOrigin = 0;
let yOrigin = 0;

function reset(){
    squareX = null;
    squareY = null;
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            nums[i][j] = 0;
        }
    }
    updateCanvas();
}

let sampleNum = 0;
function nextSample(){
    squareX = null;
    squareY = null;
    if(sampleNum == samples.length){
        sampleNum = 0;
    }
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            nums[i][j] = samples[sampleNum][i][j];
        }
    }
    sampleNum++;
    updateCanvas();
}

function drawFrame(){    
    //Draw the main square

    context.lineWidth = 8;
    context.strokeRect(xOrigin,yOrigin,sideDimension,sideDimension);

    //Draw the subsquares
    context.lineWidth = 4;
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            context.strokeRect(xOrigin + i * (sideDimension / 3), yOrigin + j * (sideDimension / 3), sideDimension /3,sideDimension/3);
        }
    }

    //Draw the individual squares
    context.lineWidth = 1;
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            context.strokeRect(xOrigin + i * (sideDimension / 9), yOrigin + j * (sideDimension / 9), sideDimension /9,sideDimension/9);
        }
    }
    context.stroke(); 
}

function updateCanvas(){
    context.clearRect(0,0,canvas.width,canvas.height);

    context.fillStyle = "white";
    context.fillRect(xOrigin,yOrigin,sideDimension,sideDimension);
    context.fillStyle = "black";

    context.font = `${sideDimension / 9 / 2}px Arial`;
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
           if(i == squareX && j == squareY){
               context.globalAlpha = 0.2;
               context.fillStyle = "cyan";
               context.fillRect(xOrigin + i * (sideDimension / 9), yOrigin + j * (sideDimension / 9), sideDimension /9,sideDimension/9);
               context.globalAlpha = 1.0;
               context.fillStyle = "black";
           }

           if(nums[i][j] !== 0){
                context.fillText(nums[i][j], xOrigin + i * (sideDimension / 9) + (sideDimension / 24), yOrigin + j * (sideDimension / 9) + sideDimension / 12);
            }
        }
    }
    drawFrame();
}

function solve(){
    do {
        changed = false;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (nums[i][j] == 0) {
                    let candidate = 0;
                    for (let k = 1; k < 10; k++) {
                        if (!searchRows(i, k) && !searchCols(j, k) && !searchBox(i, j, k)) {
                            if (candidate == 0) {
                                candidate = k;
                            } else {
                                candidate = -1;
                                break;
                            }
                        }
                    }
                    if (candidate != -1) {
                        nums[i][j] = candidate;
                        changed = true;
                    }

                }
            }
        }
        //Use other algorithm
        if (!changed) {
            for (let num = 1; num < 10; num++) {
                for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                        if (!searchBox(x * 3, y * 3, num)) {
                            let foundCandidate = false;
                            let candidateX = -1, candidateY = -1;
                            for (let xSub = 0; xSub < 3; xSub++) {
                                for (let ySub = 0; ySub < 3; ySub++) {

                                    let locX = x * 3 + xSub;
                                    let locY = y * 3 + ySub;
                                    // if square is clear
                                    if (nums[locX][locY] == 0) {
                                        if (!searchCols(locY, num) && !searchRows(locX, num)) {
                                            if (foundCandidate) {
                                                candidateX = -1;
                                                candidateY = -1;
                                            } else {
                                                foundCandidate = true;
                                                candidateX = locX;
                                                candidateY = locY;
                                            }
                                        }
                                    }
                                }
                            }

                            if (candidateX != -1) {
                                nums[candidateX][candidateY] = num;
                                changed = true;
                            }
                        }
                    }
                }
            }
        }
        updateCanvas();
    } while (changed);
    console.log("finished attempt at puzzle");
}

function searchRows(row, query) {
    for (let i = 0; i < 9; i++) {
        if (nums[row][i] == query) {
            return true;
        }
    }
    return false;
}

function searchCols(col, query) {
    for (let i = 0; i < 9; i++) {
        if (nums[i][col] == query) {
            return true;
        }
    }
    return false;
}

function searchBox(row, col, query) {
    let boxX = row - (row % 3);
    let boxY = col - (col % 3);

    for (let i = boxX; i < boxX + 3; i++) {
        for (let j = boxY; j < boxY + 3; j++) {
            if (nums[i][j] == query) {
                return true;
            }
        }
    }
    return false;
}

window.addEventListener("keydown", event => {
    if(event.key >="1" && event.key <= "9"){
        if(squareX !== null && squareY !== null){
            nums[squareX][squareY] = parseInt(event.key);
           updateCanvas();
        }
    }
});


canvas.addEventListener("click", event =>{
        squareX = parseInt((event.layerX - xOrigin) / (sideDimension / 9));
        squareY = parseInt((event.layerY - yOrigin) / (sideDimension / 9));
        updateCanvas();
});


window.addEventListener("resize",resizeWindow());

function resizeWindow(){
    canvas.height = screen.height;
    canvas.width = screen.width;
    sideDimension = canvas.height * 3/4;
    xOrigin = canvas.width / 2 - sideDimension / 2;
    yOrigin = 30;
    updateCanvas();
}
resizeWindow();