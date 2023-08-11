const express = require('express');
const mysql = require('mysql')
const cors = require('cors');
const server = express();
const bodyParser = require('body-parser');

server.use(cors())
server.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tast"
})

var newdata = "OK";

const SEND_INTERVAL = 2000;

const writeEvent = (res, sseId, data) => {
  res.write(`id: ${sseId}\n`);
  res.write(`data: ${data}\n\n`);
};
let sseId = new Date().toDateString();
const sendEvent = (_req, res) => {
  res.writeHead(200, {
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
  });

  sseId = new Date().toDateString();

  setInterval(() => {
    writeEvent(res, sseId, JSON.stringify({'data' : newdata}));
    if(newdata==="new")
        newdata = "OK";
  }, SEND_INTERVAL);

  writeEvent(res, sseId, JSON.stringify({'data' : newdata}));
};

server.post('/user', (req, res) => {
    const name = req.body.name;
    const price = req.body.price;
    const time = new Date();
    

    db.query("INSERT INTO data (Coin_name ,Coin_price, Time) VALUES(? ,?, ? ) ", [name, price, time] , (err , result)=>{
        if (err) {
            res.send({"Error : ": err});
        }
        else {
            res.send({ 'message' : "Successfully Inserted"});
        }
    });

    newdata = "new";
 
})

server.get('/dashboard', (req, res) => {
    if (req.headers.accept === 'text/event-stream') {
      sendEvent(req, res);
    } else {
      res.json({ message: 'Ok' });
    }
  });

server.get('/user', (req, res) => {
    const sql = "SELECT * FROM data";
    db.query(sql, (err, data) => {
        if(err)
            return res.send({'error' : err});
        if (data) return res.json(data);
            return res.json(data);
    })

    
})


server.listen(8080, () => {
    console.log("Server started")
})
