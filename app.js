var db = require("./mongo.js");
var login = require("./controllers/loginController.js");
var post = require("./controllers/postController.js");

var express = require("express"),
    app = express(),
    socket = require("socket.io"),
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
        console.log("signing up");
        login.signUp(data, function(data){
            if(data.err) return socket.emit('signUp', data);
            socket.emit('signUp', data);
        });
    });
    socket.on("auth", function(data) {
        console.log("Authenticating");
        login.auth(data, function(data){
           if(data.err) return socket.emit('auth', {status: false});
           socket.emit('auth', {status: data.status, user: data.user});
           socket.emit("convs", data.conv);
        });
    })
    socket.on("login", function(data){
        console.log("login");
        login.login(data, function(data){
            socket.emit('login', {status: data.status, user: data.user, cookie: data.cookie});
            //socket.emit("convs", data.conv);
        });
    });
    socket.on("logout", function(data){
        console.log("logout");
        login.logout(data, function(data){
            if(data.err) return socket.emit('login', data);
            socket.emit('logout', data);
        });
    });
    socket.on("request", function(data){
        console.log("request");
        post.request(data, function(data){
           socket.emit("request", data); 
        });
    });
    socket.on("validate", function(data) {
       post.validate(data, function(data){
           socket.emit("validate", data);
       });
    });
});