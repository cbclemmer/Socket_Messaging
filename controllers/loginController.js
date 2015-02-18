/*
    This is the Login Controller
    Module is accessed in app.js by using login.foo()
*/
var db = require("../mongo.js");

module.exports = {
    signUp: function(data, cb){
        if(!data.username||!data.email||!data.password||!data.name||!data){
            return cb({err: "Form incomplete"});
        }
        var User = db.db.collection('user');
        //determine if their is already that username or email in the database
        User.findOne({$or: [{email: data.email}, {username: data.username}]}, {username: true, email: true}, function(err, user){
            if(err)  throw err;
            if(!user){
                User.insert(data, function(err, user){
                    if(err) throw err;
                    return cb({status: "Signed up succesfully, please log in"});
                });
            }else{
                if(user.username==data.username){
                    return cb({err: "Username taken"});
                }else if(user.email==data.email){
                    return cb({err: "Email taken"});
                }
            }
        });
    },login: function(data, cb){
        if(!data.email||!data.pass||!data) return cb({err: "Incomplete data"});
        var User = db.db.collection('user');
        var Session = db.db.collection('session');
        var Conv = db.db.collection("conversation");
        User.findOne({email: data.email, password: data.pass}, {email: true, name: true, username: true}, function(err, user){
            if(err) throw err;
            if(!user){
                return cb({err: "Email or password did not match"});
            }
            else{
                Session.remove({user: user._id}, function(err, sess){
                   var cookie = user._id+require("randomstring").generate();
                    Session.insert({user: user._id, socket: data.socket, cookie: cookie, username: user.username, name: user.name, created: (new Date())}, function(err, ses){
                        if(err) throw err;
                        Conv.find({users: {$elemMatch: {username: ses.username}}, 'rejected.username': {$ne: ses.username}, 'deleted.username': {$ne: ses.username}}).toArray(function(err, convs){
                            if(err) throw err;
                            return cb({status: user, cookie: cookie, conv: convs});
                        });
                    }); 
                });
            }
        });
    },logout: function(data, cb){
        var Session = db.db.collection('session');
        Session.remove({cookie: data}, function(err, sess){
            if(err) throw err;
            if(sess)
                return cb({status: true});
            else
                return cb({err: "Not logged in"});
        });
    },auth: function(data, cb){
        var Conv = db.db.collection("conversation");
        db.db.collection('session').findOne({cookie: data}, function(err, ses){
            if(err) throw err;
            if(ses){
                db.db.collection('user').findOne({_id: ses.user}, {username: true, name: true, email: true}, function(err, user){
                    if(err) throw err;
                    Conv.find({users: {$elemMatch: {username: ses.username}}, 'rejected.username': {$ne: ses.username}, 'deleted.username': {$ne: ses.username}}).toArray(function(err, convs){
                        if(err) throw err;
                        return cb({status: true, user: user, conv: convs});
                    });
                });
            }else{
                return cb({status: false});
            }
        });
    }
}