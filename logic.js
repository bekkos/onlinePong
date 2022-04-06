let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let PLAYERS = [];
let canChange = true;



let mouseX = 0;
let mouseY = 0;

const _SIZE = 32;
const BALLSIZE = 16;
const ID = parseInt(prompt("ID"));

let settings = {};

let socket = new WebSocket("ws://localhost:8000");

socket.onopen = () => {
    socket.send("2");
    console.log("sent");
}
// Listen for messages
socket.addEventListener('message', function (event) {
    let d = JSON.parse(event.data);
    try {
        if(d[0]['sig'] == "players") {
            PLAYERS = d;
            return;
        }
    } catch {}

    try{
        if(d['sig'] == 'settings') {
            settings = d;
            console.log("settings");
            canvas.width = settings['width'];
            canvas.height = settings['height'];
            return;
        }
    }catch{}
    
    ball = d;
    
});



let ball = {
    'xVel': 0,
    'yVel': 0,
    'x': innerWidth/2,
    'y': innerHeight/2
}

const sync = () => {
    // Send Player Data
    if(ID == 0) {
        d = {
            'id': ID,
            'x': canvas.width-64,
            'y': mouseY
        }
    } else {
        d = {
            'id': ID,
            'x': 64,
            'y': mouseY
        }
    }
    
    socket.send(JSON.stringify(d));
    if(ID == 0) socket.send("4");
    // Request Player data
    socket.send("0");

    // Request Ball Data
    socket.send("1");
    // Update Logic
}

const render = () => {
    // clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, innerWidth, innerHeight)

    //render other player
    PLAYERS.map(p => {
        ctx.fillStyle = "RED";
        if(!p[0]) {
            if(p['id'] == 0 && ID != 0) {
                if(p['y']+_SIZE*6 < canvas.height) {
                    ctx.fillRect(canvas.width-64, p['y'], _SIZE, _SIZE*6);
                } else {
                    ctx.fillRect(canvas.width-64, canvas.height-_SIZE*6, _SIZE, _SIZE*6);
                }
            } else if(p['id'] == 1 && ID != 1) {
                if(p['y']+_SIZE*6 < canvas.height) {
                    ctx.fillRect(64, p['y'], _SIZE, _SIZE*6);
                } else {
                    ctx.fillRect(64, canvas.height-_SIZE*6, _SIZE, _SIZE*6);
                }
            }
        }
    });


    //render plyer
    ctx.fillStyle = "GREEN";
    if(ID == 0) {
        if(mouseY+_SIZE*6 < canvas.height) {
            ctx.fillRect(canvas.width-64, mouseY, _SIZE, _SIZE*6);
        } else {
            ctx.fillRect(canvas.width-64, canvas.height-_SIZE*6, _SIZE, _SIZE*6);
        }
    } else {
        if(mouseY+_SIZE*6 < canvas.height) {
            ctx.fillRect(64, mouseY, _SIZE, _SIZE*6);
        } else {
            ctx.fillRect(64, canvas.height-_SIZE*6, _SIZE, _SIZE*6);
        }
    }
    

    //render ball
    ctx.strokeStyle = "WHITE";
    ctx.beginPath();
    ctx.arc(ball['x'], ball['y'], BALLSIZE, 0, 2 * Math.PI);
    ctx.stroke();


    // Render score
    ctx.font = "30px Arial";
    ctx.fillText(`${PLAYERS[2]['score']} | ${PLAYERS[1]['score']}`, canvas.width/2, 50);

}



setInterval(() => {
    sync();
    render();
}, 16.7);



document.addEventListener("mousemove", (event) => {
    mouseX = event.x;
    mouseY = event.y;
})