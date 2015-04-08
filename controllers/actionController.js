/*
    This controller defines how the notifications are seen
*/
//import the mongo stuff
var db = require("../mongo.js");

module.exports = {
    showNots: 
    {
        description: "Show that the user has read their notifications",
        inputs: {
            data: "Contains the authentication cookie",
            cb: "callback"
        },
        fn: function(inputs)
        {
            //declare collections
            var Sess = db.db.collection("session");
            var Action = db.db.collection("action");
            
            //authenticate
            Sess.findOne({cookie: inputs.data}, function(err, ses){
                if(err) throw err;
                if(ses){
                    Action.update({to: {$in: [new db.objectID(ses.user)] } }, {$push: { read: ses.user}}, function(err, act){
                        if(err) throw err;
                        inputs.cb({status: true});
                    });
                }else{
                    return inputs.cb({err: "You are not authenticated"});
                }
            })
        }
    },
}