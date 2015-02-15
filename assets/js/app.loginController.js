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
            console.log("signing up");
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
        socket.on("auth", function(data) {
            if(data.status){
                rs.user = data.user;
                rs.auth = true;
                rs.page = "home";
                window.location.hash = rs.page;
            }
        })
        socket.on("signUp", function(data){
            if(data.err) return showErr(data.err);
            showInfo(data.status);
        });
        socket.on('login', function(data) {
            if(data.err) return showErr(data.err);
            showInfo("Logged in");
            rs.user = data.status;
            rs.auth = true;
            document.cookie = "auth="+data.cookie;
            rs.page = "home";
            window.location.hash = rs.page;
        });
        socket.on("logout", function(data){
            if(data.err) return showErr(data.err);
            rs.user = {};
            rs.auth = false;
            rs.messages = [];
            rs.convs = [];
            document.cookie = "auth=";
            rs.page = "login";
            window.location.hash = rs.page;
        });
    }]);
})();