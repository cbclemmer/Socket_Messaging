var db = require("./mongo.js");
var login = require("./controllers/loginController.js");

var express = require("express"),
    app = express(),
    socket = require("socket.io"),
    //cons = require("consolidate"),
    server = require("http").Server(app),
    io = require("socket.io")(server);

//express
app.set('views', __dirname + '/assets/views');
app.use(express.static(__dirname+'/assets'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index.html');
});

db.mongoclient.open(function(err, mongoclient) {
    if(err) throw err;
    server.listen(8080);
    console.log("Server started");
});

io.on('connection', function(socket){
    console.log("Socket Connected on: "+socket.id);
    socket.on("signUp", function(data){
        login.signUp(data, function(data){
            if(data.err) return socket.emit('signUp', data);
            socket.emit('signUp', data);
        });
    });
    socket.on("auth", function(data) {
        login.auth(data, function(data){
           if(data.err) return socket.emit('auth', {status: false});
           socket.emit('auth', data);
        });
    })
    socket.on("login", function(data){
        console.log("login");
        login.login(data, function(data){
            socket.emit('login', data);
        });
    });
    socket.on("logout", function(data){
        console.log("logout");
        login.logout(data, function(data){
            if(data.err) return socket.emit('login', data);
            socket.emit('logout', data);
        });
    });
});