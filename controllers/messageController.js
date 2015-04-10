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
        
    }, newMess: {
        description: "Creates a new message",
        
        inputs: {
            cookie: "The cookie that authenticates the user",
            mess: "The text of the message",
            conv: "The ID of the conversation being posted to"
            
        }, exits: {
            success: "The message was created",
            markup: "The message had a '<' in it. This is so that users don't try to implement code in the message",
            permission: "The user does not have permission to post to the conversation",
            notAuth: "The user is not logged in"
            
        }, fn: function(inputs, exits) {
            var sess = db.db.collection("session");
            var Mess = db.db.collection('message');
            var Conv = db.db.collection("conversation");
            
            if(inputs.mess.search("<")!=-1) return exits.markup();
            
            sess.findOne({cookie: inputs.cookie}, function(err, sess){
                if(err) throw err;
                if(sess){
                    //find the conversation and make sure this user is a part of it
                    Conv.findOne({_id: (new db.objectID(inputs.conv)), 'users._id': (new db.objectID(sess.user))}, function(err, conv){
                       if(err)  throw err;
                       if(conv){
                           Mess.insert({conv: conv._id, content: inputs.mess, username: sess.username}, function(err, mess){
                               if(err) throw err;
                               return exits.success(mess);
                           });
                       }else{
                           return exits.permission();
                       }
                    });
                }else{
                    return exits.notAuth();
                }
            });
        }
    }
}