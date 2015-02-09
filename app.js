var db = require("./mongo.js");
var login = require("./controllers/loginController.js");

var express = require("express"),
    app = express(),
    socket = require("socket.io"),
    cons = require("consolidate"),
    server = require("http").Server(app),
    io = require("socket.io")(server);

//express
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + "/assets/views");
app.use(express.static(__dirname+'/assets'));

app.get('/', function(req, res){
    res.render('index');
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
            //if there was an error pass it back to client
            if(data.err) return socket.emit('login', data);
            //if everything worked out
            socket.emit('login', data);
        });
    });
});