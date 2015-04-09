/*
    This is the Login Controller
    Module is accessed in app.js by using login.foo()
*/
var db = require("../mongo.js");

module.exports = {
    signUp: 
    {
        description: "Registers the user. This creates a new user in the database",
        inputs: 
        {
            username: "username",
            email: "name@email.com",
            password: "password",
            name: "firstname lastname",
        },
        exits: 
        {
            success: "User has succesfully signed up",
            fromIncomplete: "The form was not filled out completely",
            whitespace: "The username contains an illegal character",
            password: "Password was not at least 8 characters",
            unTaken: "The username has already been used",
            emailTaken: "The email has already been registered with another account",
        },
        fn: function(inputs, exits){
            var User = db.db.collection('user');
            
            if(!inputs.username||!inputs.email||!inputs.password||!inputs.name||!inputs){
                return exits.formIncomplete();
            }
            inputs.email = inputs.email.toLowerCase();
            //validate everything was inputted correctly.
            if(inputs.username.search(" ")!=-1||inputs.username.search(",")!=-1||inputs.username.search("<")!=-1)
                return exits.whitespace();
            else if(inputs.password.length<8)
                return exits.password();
            //determine if their is already that username or email in the database
            User.findOne({$or: [{email: inputs.email}, {username: inputs.username}]}, {username: true, email: true}, function(err, user){
                if(err)  throw err;
                if(!user){
                    User.insert(inputs, function(err, user){
                        if(err) throw err;
                        return exits.success();
                    });
                }else{
                    if(user.username==inputs.username){
                        return exits.unTaken();
                    }else if(user.email==inputs.email){
                        return exits.emailTaken();
                    }
                }
            });
        }
    },
    login: function(data, cb){ 
        if(!data.email||!data.pass||!data) return cb({err: "Incomplete data"});
        var User = db.db.collection('user');
        var Session = db.db.collection('session');
        var Conv = db.db.collection("conversation");
        data.email = data.email.toLowerCase();
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
        var Action = db.db.collection("action");
        db.db.collection('session').findOne({cookie: data}, function(err, ses){
            if(err) throw err;
            if(ses){
                db.db.collection('user').findOne({_id: ses.user}, {username: true, name: true, email: true}, function(err, user){
                    if(err) throw err;
                    Conv.find({users: {$elemMatch: {username: ses.username}}, 'rejected.username': {$ne: ses.username}, 'deleted.username': {$ne: ses.username}}).toArray(function(err, convs){
                        if(err) throw err;
                        Action.find({"from.name": {$ne: ses.name}, to: {$in: [ses.user]}, read: {$nin: [ses.user]}}).toArray(function(err, actions){
                            if(err) throw err;
                            return cb({status: true, user: user, conv: convs, actions: actions});
                        });
                    });
                });
            }else{
                return cb({status: false});
            }
        });
    }
}