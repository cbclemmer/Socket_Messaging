/*
    This controller defines how the notifications are seen
*/
//import the mongo stuff
var db = require("../mongo.js");

module.exports = {
    showNots: function(data, cb){
        //declare collections
        var Sess = db.db.collection("session");
        var Action = db.db.collection("action");
        
        //authenticate
        Sess.findOne({cookie: data}, function(err, ses){
            if(err) throw err;
            if(ses){
                //console.log(ses);
                Action.update({to: {$in: [new db.objectID(ses.user)] } }, {$push: { read: ses.user}}, function(err, act){
                    if(err) throw err;
                    console.log(act);
                    cb({status: true});
                });
            }else{
                return cb({err: "You are not authenticated"});
            }
        })
    }
}