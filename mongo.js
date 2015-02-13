var 
MongoClient = require("mongodb").MongoClient,
Server = require("mongodb").Server;

var mongoclient = new MongoClient(new Server('localhost', 27017, {'native-parser': true}));
var db = mongoclient.db("message");
var objectID = require('mongodb').ObjectID;
module.exports = {
    mongoclient: mongoclient,
    db: db,
    objectID: objectID
}