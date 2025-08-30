const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let players = {};
let playerData = {};
let nextId = 1;

console.log("Szerver fut a " + PORT + " porton");

wss.on("connection", (ws) => {
    const playerId = "Player" + nextId++;
    players[playerId] = ws;
    playerData[playerId] = { pos: {x:0,y:0}, hp:100 };
    
    broadcast({ action:"players_count", count: Object.keys(players).length });

    ws.on("message", (msg) => {
        const data = JSON.parse(msg);
        if(data.action === "move") playerData[playerId].pos = data.pos;
        if(data.action === "shoot") broadcast({ action:"shoot", id: playerId, pos:data.pos, dir:data.dir });
    });

    ws.on("close", () => {
        delete players[playerId];
        delete playerData[playerId];
        broadcast({ action:"players_count", count: Object.keys(players).length });
    });
});

function broadcast(obj){
    const msg = JSON.stringify(obj);
    for(const id in players) players[id].send(msg);
}
