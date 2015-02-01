var express = require("express"),
    app = express(),
    socket = require("socket.io"),
    MongoClient = require("mongodb").MongoClient,
    Server = require("mongodb").Server,
    cons = require("consolidate"),
    server = require("http").Server(app),
    io = require("socket.io")(server);

//express
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + "/assets/views");
app.use(express.static(__dirname+'/assets'));

//mongo
var mongoclient = new MongoClient(new Server('localhost', 27017, {'native-parser': true}));
var db = mongoclient.db("message");

app.get('/', function(req, res){
    res.render('index');
});

mongoclient.open(function(err, mongoclient) {
    if(err) throw err;
    server.listen(8080);
    console.log("Server started");
});

io.on('connection', function(socket){
    console.log("Socket Connected on: "+socket.id);
    socket.on("signUp", function(data){
        console.log("signUp");
        db.collection('user').insert({
            username: data.username,
            email: data.email,
            password: data.password
        }, function(err, user){
            if(err)  throw err;
            socket.emit('signUp', {status: true});
        });
    });
});