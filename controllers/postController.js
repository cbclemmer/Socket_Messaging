var db = require("../mongo.js");
/*
    Post Controller
    Post schema
    {
        id: ...
        users: id array
        usernames: array
        names: array
        the validated array stores the ids of the users that have accepted the invatation to talk
        validated: array
        the rejected array stores the ids of the users that rejected the invatation to talk, if all but one user rejects the conversation, it is deleted
        rejected: array
        the deleted array store the users that deleted validated conversation
        deleted: array
    }
    
*/


module.exports = {
    request: function(data, cb){
        var User = db.db.collection("user");
        var Conv = db.db.collection("conversation");
        var Sess = db.db.collection("session");
        //basic auth, id of the user is sess.user
        Sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                    if(data.un[0]==sess.username) return cb({err: "You are making conversation with yourself?"})
                    var arr = [{username: sess.username}];
                    for(var i=0;i<data.un.length;i++){
                        arr.push({username: data.un[i]});
                    }
                    User.find({$or: arr}, {username: true, name: true}).toArray(function(err, users){
                        if(err) throw err;
                        if(users.length>1){
                            Conv.findOne({users: users}, function(err, conv){
                                if(err) throw err;
                                if(!conv){
                                    var verified = {
                                        _id: sess.user,
                                        username: sess.username,
                                        name: sess.name
                                    };
                                    Conv.insert({users: users, validated: [verified], rejected: [], deleted: [], created: (new Date())}, function(err, conv){
                                        if(err) throw err;
                                        cb(conv);
                                    })
                                }else{
                                    cb({err: "Conversation already started"});
                                }
                            });
                        }else{
                            if(users.length==1){
                                return cb({err: "User not found"});
                            }else{
                                return cb({err: ("Could not find users")});
                            }
                        }
                    });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    },
    logintest: function(data, cb){
        var sess = db.db.collection("session");
        sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                
            }else{
                return cb({err: "Not logged in"});
            }
        });
    },
    validate: function(data, cb){
        var sess = db.db.collection("session");
        var Conv = db.db.collection("conversation");
        sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                // Make sure it is that conversation, and it has not already been validated
                Conv.update({_id: new db.objectID(data.conv), 'validated.username': {$ne: sess.username}}, {$push: {validated: {
                    _id: sess._id,
                    username: sess.username,
                    name: sess.name
                }}}, function(err, conv){
                    if(err) throw err;
                    if(conv){
                        Conv.findOne({_id: new db.objectID(data.conv)}, function(err, conv) {
                            if(err) throw err;
                            cb({conv: conv, user: sess.username});
                        });
                    }else{
                        return cb({err: "Internal error, could not find conversation or is already validated"});
                    }
                });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    },
    reject: function(data, cb){
        var sess = db.db.collection("session");
        var Conv = db.db.collection("conversation");
        sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                Conv.update({_id: new db.objectID(data.conv), 'rejected.username': {$ne: sess.username}}, {$push: {rejected: {
                    _id: sess._id,
                    username: sess.username,
                    name: sess.name
                }}}, function(err, conv){
                    if(err) throw err;
                    if(conv){
                        Conv.findOne({_id: new db.objectID(data.conv)}, function(err, conv) {
                            if(err) throw err;
                            conv.reject = sess._id;
                            Conv.remove({rejected: {$size: (conv.users.length-1)}}, function(err, conv2){
                                if(err) throw err;
                                cb(conv);
                            });
                        });
                    }else{
                        return cb({err: "Internal error, could not find conversation or is already rejected"});
                    }
                });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    },
    delet: function(data, cb){
        var sess = db.db.collection("session");
        var Conv = db.db.collection("conversation");
        sess.findOne({cookie: data.cookie}, function(err, sess){
            if(err) throw err;
            if(sess){
                Conv.update({_id: new db.objectID(data.conv), 'deleted.username': {$ne: sess.username}}, {$push: {deleted: {
                    _id: sess.user,
                    name: sess.name,
                    username: sess.username
                }}}, function(err, conv){
                    if(err) throw err;
                    if(conv){
                        Conv.findOne({_id: new db.objectID(data.conv)}, function(err, conv){
                            if(err) throw err;
                            conv.delet = sess.user;
                            Conv.remove({deleted: {$size: (conv.users.length)}}, function(err, conv2){
                                if(err) throw err;
                                cb(conv);
                            });
                        });
                    }else{
                        return cb({err: "Internal error, could not find conversation or is already deleted"});
                    }
                });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    }
}