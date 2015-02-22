(function(){
    var app = angular.module('login', []);
        app.controller("loginController", ['$http', '$scope', '$rootScope', 'socket', function(h, s, rs, socket){
        rs.signUp = false;
        this.temp = {};
        
        //page load auth
        var auth = getCookie("auth");
        //make sure this doesn't get called twice
        if(auth!=""&&!rs.once){
            socket.emit('auth', auth);
        }
        rs.once = true;
        this.login = function(email, pass){
            socket.emit("login", {
               email: email,
               pass: pass
            });
            s.log.temp = {};
        };
        this.signUp = function(user, name, email, pass, cpass){
            if(pass == cpass){
                socket.emit("signUp", {
                    name: name,
                    username: user,
                    email: email,
                    name: name,
                    password: pass
                });
                s.log.temp = {};
            }else{
                showErr("Passwords do not match")
            }
        };
        this.logout = function(){
            socket.emit("logout", getCookie("auth"));
        };
        this.toggleSign = function(){
            rs.signUp = !rs.signUp;
        }
    }]);
})();