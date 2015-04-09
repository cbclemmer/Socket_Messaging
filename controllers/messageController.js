var db = require("../mongo.js");

module.exports = {
    
    getMessages: {
        description:    "Gets all of the messages in a given conversation",
        
        inputs: {
            cookie:     "The cookie that authenticates the user",
            conv:       "The ID of the conversation in question"
            
        }, exits: {
            success:    "All the messages are passed through",
            permission: "The user cannot access this conversation",
            notAuth:    "The user is not logged in"
            
        }, fn: function(inputs, exits) {
            //start log in
            var Sess = db.db.collection("session");
            var Mess = db.db.collection('message');
            var Conv = db.db.collection("conversation");
    
            Sess.findOne({cookie: inputs.cookie}, function(err, sess){
                if(err) throw err;
                if(sess){
                    //find a conversation that matches the input and has the user as a participant
                    Conv.findOne({_id: (new db.objectID(inputs.conv)), 'users._id': (new db.objectID(sess.user))}, function(err, conv){
                        if(err) throw err;
                        if(conv){
                            Mess.find({conv: conv._id}).toArray(function(err, mess){
                            if(err) throw err;
                                return exits.success({messages: mess, conv: inputs.conv, user: sess.user});
                            });
                        }else{
                            return exits.permission();
                        }
                    });
                }else{
                    return exits.notAuth()
                }
            });
        }
    }, newMess: function(data, cb){
        var sess = db.db.collection("session");
        var Mess = db.db.collection('message');
        var Conv = db.db.collection("conversation");
        if(data.mess.search("<")!=-1) return cb({err: "Message cannot have a '<' in it"});
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