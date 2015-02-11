var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

var phone = 5555555555;
var threshold = 0.5;


app.set('port', (process.env.PORT || 5000));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function(req, res) {
    res.render('setup');
});

/* Test for web sockets
app.get('/wsockets', function(req, res) {
    res.render('wsockets');
});
*/



var util = require('util'),
    exec = require('child_process').exec,
    child


function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

function isFloat(value) {
  return !isNaN(value) &&
         parseFloat(value) == value &&
         !isNaN(parseFloat(value));
}

app.post('/results', function(req, res) {
    phone = req.body.phone;
    threshold = req.body.threshold;

    if (!isInt(phone)) {
        res.send('error: er = 1 phone number, please use an int from 1111111111 to 9999999999');
        return;
    } 
    i_phone = parseInt(phone, 10);
    if (i_phone < 1111111111 || i_phone > 9999999999) {
        res.send('error: er = 2 phone number, please use an int from 1111111111 to 9999999999');
        return;
    }
    if (!isFloat(threshold)) {
        res.send('error: er = 3, threshold, please use a float from 0.0001 to 0.9999');
        return;
    }
    i_threshold = parseFloat(threshold);
    if (i_threshold <= 0.0001  || i_threshold > 0.9999) {
        res.send('error: er = 4, threshold, please use a float from 0.0001 to 0.9999');
        return;
    }

    dataStr = "curl -H \"Content-Type: application/json\" -X POST https://api.sendhub.com/v1/messages/?username=6506562656\\&api_key=c35b7fa306c85be4ffe8e70db5b7115413edb15a --data \'{\"contacts\" : [\"+1" + phone + "\"],\"text\" : \"Start of LoudText Test\"}\'";
  console.log(dataStr);
  child = exec(dataStr,
  function (error, stdout, stderr) {      // one easy function to capture data/errors
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
    res.render('results', {phone:phone, threshold:threshold});
});

wss.on('connection', function(ws) {
  console.log('CONN RX');
  dataStr = "curl -H \"Content-Type: application/json\" -X POST https://api.sendhub.com/v1/messages/?username=6506562656\\&api_key=c35b7fa306c85be4ffe8e70db5b7115413edb15a --data \'{\"contacts\" : [\"+1" + phone + "\"],\"text\" : \"YOU ARE TOO LOUD\"}\'";
  console.log(dataStr);
  child = exec(dataStr,
  function (error, stdout, stderr) {      // one easy function to capture data/errors
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
});


app.use(express.static(__dirname + '/public'));
// GET /static/style.css etc.
app.use('/static', express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
