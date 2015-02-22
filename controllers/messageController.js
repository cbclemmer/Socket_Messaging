var db = require("../mongo.js");

module.exports = {
    getMessages: function(data, cb){
        //start log in
        var Sess = db.db.collection("session");
        var Mess = db.db.collection('message');
        var Conv = db.db.collection("conversation");
        Sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                Conv.findOne({_id: (new db.objectID(data.conv)), 'users._id': (new db.objectID(sess.user))}, function(err, conv){
                    if(err) throw err;
                    if(conv){
                        Mess.find({conv: conv._id}).toArray(function(err, mess){
                            if(err) throw err;
                            cb({messages: mess, conv: data.conv, user: sess.user});
                        });
                    }else{
                        cb({err:"you do not have access to this conversation"});
                    }
                });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    },
    newMess: function(data, cb){
        var sess = db.db.collection("session");
        var Mess = db.db.collection('message');
        var Conv = db.db.collection("conversation");
        if(data.username.search("<")==-1) cb({err: "Message cannot have a '<' in it"});
        sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                //find the conversation and make sure this user is a part of it
                Conv.findOne({_id: (new db.objectID(data.conv)), 'users._id': (new db.objectID(sess.user))}, function(err, conv){
                   if(err)  throw err;
                   if(conv){
                       Mess.insert({conv: conv._id, content: data.mess, username: sess.username}, function(err, mess){
                           if(err) throw err;
                           cb(mess);
                       });
                   }else{
                       cb({err: 'you do not have acces to this conversation'});
                   }
                });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    }
}