const AVG_TRI_DIM = 140;

const PRIMARY_COLOR = "black";
const BASE_COLOR = "white";
function CoordSet(xCoord, yCoord){
    this.x = xCoord;
    this.y = yCoord;
}

var backElement = document.getElementById("background"),
    two = new Two({ 
        fullscreen: true
    });
 
two.appendTo(backElement);
two.renderer.domElement.style.background = '#ffffff';
two.renderer.domElement.fitted = true;  


function generateGradient(triangle){
    let gradientStartIndex = Math.random() * 3;

    if(gradientStartIndex < 1){ 
        let gradientColor = two.makeLinearGradient(triangle.vertices[0].x,triangle.vertices[0].y,triangle.vertices[1].x,triangle.vertices[1].y,new Two.Stop(0,PRIMARY_COLOR,0.4),new Two.Stop(1,BASE_COLOR,1));
        return gradientColor;
    }else if(gradientStartIndex < 2){
        let gradientColor = two.makeLinearGradient(triangle.vertices[1].x,triangle.vertices[1].y,triangle.vertices[2].x,triangle.vertices[2].y,new Two.Stop(0,PRIMARY_COLOR,0.4),new Two.Stop(1,BASE_COLOR,1));
        return gradientColor;
    }else{
        let gradientColor = two.makeLinearGradient(triangle.vertices[2].x,triangle.vertices[2].y,triangle.vertices[0].x,triangle.vertices[0].y,new Two.Stop(0,PRIMARY_COLOR,0.4),new Two.Stop(1,BASE_COLOR,1));
        return gradientColor;
    }
}



let numAcross = two.width/AVG_TRI_DIM + 2;
let numDown =  two.height/AVG_TRI_DIM + 2;



let offsetArray = new Array();
for(let i = 0; i < numAcross; i++){
    offsetArray[i] = [];
    for(let j = 0; j < numDown; j++){
        offsetArray[i][j] = new CoordSet((i) * AVG_TRI_DIM + Math.random() * 90, (j) * AVG_TRI_DIM + Math.random() * 90);
    }
}

for(let i = 0; i < numAcross-1; i++){
    for(let j = 0; j < numDown-1; j++){
        let triangle = two.makePath(offsetArray[i][j].x - AVG_TRI_DIM,offsetArray[i][j].y - AVG_TRI_DIM,offsetArray[i+1][j].x - AVG_TRI_DIM, offsetArray[i+1][j].y - AVG_TRI_DIM, offsetArray[i][j+1].x - AVG_TRI_DIM, offsetArray[i][j+1].y - AVG_TRI_DIM, true);
        triangle.noStroke().fill = generateGradient(triangle);
    }
}

for(let i = 1; i < numAcross; i++){
    for(let j = 0; j < numDown-1; j++){
        let triangle = two.makePath(offsetArray[i][j].x- AVG_TRI_DIM,offsetArray[i][j].y- AVG_TRI_DIM,offsetArray[i][j+1].x- AVG_TRI_DIM,offsetArray[i][j+1].y- AVG_TRI_DIM, offsetArray[i-1][j+1].x- AVG_TRI_DIM, offsetArray[i-1][j+1].y- AVG_TRI_DIM, true);
        triangle.noStroke().fill = generateGradient(triangle);
    }
}

two.update();