/*
    This is the Login Controller
    Module is accessed in app.js by using login.foo()
*/
var db = require("../mongo.js");

module.exports = {
    
    signUp: {
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
        
    }, login: {
        description: "Creates a new session and passes a cookie for the user to store for authentication, effectively logging the user in.",
        
        inputs: {
            email: "name@email.com",
            pass: "The attempted password"
            
        }, exits: {
            success:    "The user is logged in and a new session is created",
            incomplete: "The form was not completed",
            match:      "The email and password did not match",
            
        }, fn: function(inputs, exits){
            //determines if the form is complete
            if(!inputs.email||!inputs.pass||!inputs) return exits.incomplete();
        
            var User = db.db.collection('user');
            var Session = db.db.collection('session');
            var Conv = db.db.collection("conversation");
            
            inputs.email = inputs.email.toLowerCase();
            User.findOne({email: inputs.email, password: inputs.pass}, {email: true, name: true, username: true}, function(err, user){
                if(err) throw err;
                if(!user){
                    return exits.match();
                }
                else{
                    Session.remove({user: user._id}, function(err, sess){
                       var cookie = user._id+require("randomstring").generate();
                        Session.insert({user: user._id, socket: inputs.socket, cookie: cookie, username: user.username, name: user.name, created: (new Date())}, function(err, ses){
                            if(err) throw err;
                            Conv.find({users: {$elemMatch: {username: ses.username}}, 'rejected.username': {$ne: ses.username}, 'deleted.username': {$ne: ses.username}}).toArray(function(err, convs){
                                if(err) throw err;
                                return exits.success({status: user, cookie: cookie, conv: convs})
                            });
                        }); 
                    });
                }
            });
        }
        
    }, logout: {
        description: "removes the session and prompts the client to destroy the cookie",
        
        inputs: {
            cookie: "The cookie that authenticates the user"
            
        }, exits: {
            success: "The cookie and session are destroyed",
            notAuth: "The user is not logged in"
            
        }, fn: function(inputs, exits){
            var Session = db.db.collection('session');
            
            Session.remove({cookie: inputs.cookie}, function(err, sess){
                if(err) throw err;
                if(sess)
                    return exits.success();
                else
                    return exits.notAuth();
            });
        }
        
    }, auth: function(data, cb){
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