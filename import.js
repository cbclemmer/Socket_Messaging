//Express Init
var express = require("express"),
    app = express(),
    socket = require("socket.io"),
    server = require("http").Server(app),
    io = require("socket.io")(server);


module.exports = {
    //Data base
    db: require("./mongo.js"),
    
    //Controllers
    login: require("./controllers/loginController.js"),
    post: require("./controllers/postController.js"),
    message: require("./controllers/messageController.js"),
    action: require("./controllers/actionController.js"),
    
    //Express settings
    app: app,
    server: server,
    express: express,
    io: io
}