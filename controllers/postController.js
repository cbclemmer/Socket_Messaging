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
        the rejected array stores the ids of the users that rejected the invatation to talk
        rejected: array
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
                    var arr = [{username: sess.username}];
                    for(var i=0;i<data.un.length;i++){
                        arr.push({username: data.un[i]});
                    }
                    User.find({$or: arr}, {username: true, name: true}).toArray(function(err, users){
                        if(err) throw err;
                        if(users){
                            Conv.findOne({users: users}, function(err, conv){
                                if(err) throw err;
                                if(!conv){
                                    var verified = {
                                        id: sess.user,
                                        username: sess.username,
                                        name: sess.name
                                    };
                                    Conv.insert({users: users, validated: [verified], rejected: [], created: (new Date())}, function(err, conv){
                                        if(err) throw err;
                                        cb({conv: conv});
                                    })
                                }else{
                                    cb({err: "Conversation already started"});
                                }
                            });
                        }else{
                            return cb({err: ("Could not find users")});
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
                Conv.update({_id: new db.objectID(data.conv), "validated.id": {$ne: (new db.objectID(sess.id))}}, {$push: {validated: {
                    id: sess._id,
                    username: sess.username,
                    name: sess.name
                }}}, function(err, conv){
                    if(err) throw err;
                    if(conv){
                        Conv.findOne({_id: new db.objectID(data.conv)}, function(err, conv) {
                            if(err) throw err;
                            cb(conv);
                        });
                    }else{
                        return cb({err: "Internal error, could not find conversation or is already vlaidated"});
                    }
                });
            }else{
                return cb({err: "Not logged in"});
            }
        });
    }
}