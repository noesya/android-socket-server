const { networkInterfaces, hostname } = require('os');
const port = 3000;
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const nets = networkInterfaces();
const hostnames = ["localhost", "*"];
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
      hostnames.push(net.address);
    }
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/shader', function (req, res) {
  res.sendFile(__dirname + '/shader.html');
});


app.get('/sound', function (req, res) {
  res.sendFile(__dirname + '/sound.html');
});

io.on('connection', (socket) => {
  socket.on('motion', (touch) => {
    console.log(touch.ratio.x)
    io.emit('reception', touch);
  });
});

server.listen(port, () => {
  console.log(`listening on:`);
  hostnames.forEach(hostname => {
    console.log(`- http://${hostname}:${port}`);
  })
});