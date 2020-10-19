const express = require('express')
const d3 = require("d3");
var favicon = require('serve-favicon')

const app = express()
const port = 8090

const path = require('path');
const router = express.Router();

router.get('/',function(req,res){

  res.sendFile(path.join(__dirname+'/index.html'));
  
});

app.use(favicon(__dirname + '/favicon.ico'));

app.use(express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/images'));

app.use('/', router);

app.listen(port, () => console.log(`running on localhost:${port}!`))

