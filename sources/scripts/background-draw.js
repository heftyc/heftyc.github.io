PIX_PER_AVG_TRI_HEIGHT = 95;

function CoordSet(xCoord, yCoord){
    this.x = xCoord;
    this.y = yCoord;
}


var backElement = document.getElementById("background"),
    two = new Two({ 
        fullscreen: false
    });
 
two.appendTo(backElement);
two.renderer.domElement.style.background = '#ffffff';
two.renderer.domElement.fitted = true;  


function generateGradient(triangle){
    let gradientStartIndex = Math.random() * 3;

    if(gradientStartIndex < 1){ 
        let gradientColor = two.makeLinearGradient(triangle.vertices[0].x,triangle.vertices[0].y,triangle.vertices[1].x,triangle.vertices[1].y,new Two.Stop(0,"purple",0.4),new Two.Stop(1,"white",1));
        return gradientColor;
    }else if(gradientStartIndex < 2){
        let gradientColor = two.makeLinearGradient(triangle.vertices[1].x,triangle.vertices[1].y,triangle.vertices[2].x,triangle.vertices[2].y,new Two.Stop(0,"purple",0.4),new Two.Stop(1,"white",1));
        return gradientColor;
    }else{
        let gradientColor = two.makeLinearGradient(triangle.vertices[2].x,triangle.vertices[2].y,triangle.vertices[0].x,triangle.vertices[0].y,new Two.Stop(0,"purple",0.4),new Two.Stop(1,"white",1));
        return gradientColor;
    }
}

let height = two.height;
let width  = two.width;

let numAcross = height/PIX_PER_AVG_TRI_HEIGHT;
let numDown = width/PIX_PER_AVG_TRI_HEIGHT;

let offsetArray = new Array();
//let YoffsetArray = new Array();
for(let i = 0; i < numAcross; i++){
    offsetArray[i] = [];
    for(let j = 0; j < numDown; j++){
        offsetArray[i][j] = new CoordSet(i * PIX_PER_AVG_TRI_HEIGHT + Math.random() * 90, j * PIX_PER_AVG_TRI_HEIGHT + Math.random() * 90);
    }
}

for(let i = 0; i < numAcross; i++){
    for(let j = 0; j < numDown; j++){
 //       let dot = two.makeCircle(offsetArray[i][j].x ,offsetArray[i][j].y,3,5);
   //     dot.fill = "#ffffff";
    }
}

let gradientColor = two.makeLinearGradient(1,1,400,400,new Two.Stop(0,"purple",1),new Two.Stop(1,"white",1));

for(let i = 0; i < numAcross-1; i++){
    for(let j = 0; j < numDown-1; j++){
        let triangle = two.makePath(offsetArray[i][j].x,offsetArray[i][j].y,offsetArray[i+1][j].x,offsetArray[i+1][j].y, offsetArray[i][j+1].x, offsetArray[i][j+1].y, true);
        triangle.noStroke().fill = generateGradient(triangle);
    }
}

for(let i = 1; i < numAcross; i++){
    for(let j = 0; j < numDown-1; j++){
        let triangle = two.makePath(offsetArray[i][j].x,offsetArray[i][j].y,offsetArray[i][j+1].x,offsetArray[i][j+1].y, offsetArray[i-1][j+1].x, offsetArray[i-1][j+1].y, true);
        triangle.noStroke().fill = generateGradient(triangle);
    }
}

two.update();