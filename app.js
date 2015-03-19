var db = require("./mongo.js");

//Controllers
var login = require("./controllers/loginController.js");
var post = require("./controllers/postController.js");
var message = require("./controllers/messageController.js");
var action = require("./controllers/actionController.js");

//Express settings
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

//Start the server
db.mongoclient.open(function(err, mongoclient) {
    if(err) throw err;
    var port = process.argv[2];
    if(!port) port = 8080; 
    server.listen(port);
    console.log("Server started on port "+port);
});


//All the Socket connections
io.on('connection', function(socket){
    socket.on("signUp", function(data){
        console.log("signing up");
        login.signUp(data, function(data){
            if(data.err) return socket.emit('signUp', data);
            socket.emit('signUp', data);
        });
    });
    socket.on("auth", function(data) {
        //update the users socket with each page load
        db.db.collection('session').update({cookie: data}, {$set: {socket: socket.id}}, function(err, sess){
            console.log("Authenticating");
            login.auth(data, function(data){
               if(data.err) return socket.emit('auth', {status: false});
               //each conversation has a channel for talking
               if(data.status){
                    socket.join("user"+data.user._id);
                    socket.emit('auth', {status: data.status, user: data.user, actions: data.actions});
                    socket.emit("convs", data.conv);
               }else{
                    socket.emit('auth', {status: data.status});
               }
            });
        });
    });
    socket.on("login", function(data){
        data.socket = socket.id;
        console.log("login");
        db.db.collection('session').update({cookie: data.cookie}, {$set: {socket: socket.id}}, function(err, sess){
            login.login(data, function(data){
               //each conversation has a channel for talking
                if(!data.err){
                    socket.join("user"+data.status._id);
                    socket.emit('login', {status: data.status, user: data.status, cookie: data.cookie});
                }else{
                    socket.emit("login", {err: data.err});
                }
            });
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
            if(data.err){
                return socket.emit("request", data);
            }else{
                for(var i=0;i<data.conv[0].users.length;i++){
                    io.to("user"+data.conv[0].users[i]._id).emit("convs", data.conv);
                }
                for(var i=0;i<data.action.to.length;i++){
                    io.to("user"+data.action.to[i]).emit("action", data.action);
                }
            }
        });
    });
    socket.on("validate", function(data) {
        post.validate(data, function(data){
            if(data.err){
                return socket.emit("request", data);
            }else{
                for(var i=0;i<data.conv.users.length;i++){
                    io.to("user"+data.conv.users[i]._id).emit("validate", data);
                }
            }
        });
    });
    socket.on("reject", function(data){
        post.reject(data, function(data){
            if(!data.err){
                for(var i=0;i<data.users.length;i++){
                    io.to("user"+data.users[i]._id).emit("reject", data);
                }
            }else{
                socket.emit("reject", data);
            }
            
        });
    });
    socket.on("delet", function(data){
        socket.leave("conv"+data.conv);
        post.delet(data, function(data){
            socket.emit("delet", data);
        });
    });
    //begin messages sockets
    socket.on("getMessages", function(data){
        var rooms = socket.rooms;
        message.getMessages(data, function(data){
            console.log("getMessages");
            socket.join("conv"+data.conv);
            socket.emit("getMessages", data.messages);
        });
    });
    socket.on("newMess", function(data){
        message.newMess(data, function(data){
            console.log("newMess");
            if(data.err) return socket.emit("newMess", data);
            io.to("conv"+data[0].conv).emit("newMess", data[0]);
        });
    });
    
    //Action Controller sockets
    socket.on("showNots", function(data){
        console.log("this");
        action.showNots(data, function(data){
            console.log("Notifications seen");
            socket.emit("showNots", data)
        });
    });
    
    socket.on("disconnect", function(data){
        /*db.db.collection('session').remove({socket: socket.id}, function(err, sess){
            if(err) throw err;
            if(sess) console.log(socket.id+" logged off");
        });*/
    });
});