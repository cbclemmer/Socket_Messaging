(function(){
    var app = angular.module("app", ['btford.socket-io']);
    app.factory('socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect('http://104.131.176.87:8080/')
        });
    });

    app.controller("userController", ['$scope', '$rootScope', function(s, rs){
        rs.auth = false;
        this.hi = "hello";
    }]);
    app.controller("loginController", ['$http', '$scope', '$rootScope', 'socket', function(h, s, rs, socket){
        rs.signUp = false;
        this.temp = {};
        
        //page load auth
        var auth = getCookie("auth");
        if(auth!=""){
            socket.emit('auth', auth);
        }
        
        this.login = function(email, pass){
            socket.emit("login", {
               email: email,
               pass: pass
            });
            s.log.temp = {};
        };
        this.signUp = function(user, email, pass, cpass){
            console.log("signing up");
            if(pass == cpass){
                socket.emit("signUp", {
                    username: user,
                    email: email,
                    name: name,
                    password: pass
                });
            }else{
                showErr("Passwords do not match")
            }
        };
        this.toggleSign = function(){
            rs.signUp = !rs.signUp;
        }
        socket.on("auth", function(data) {
            if(data.status){
                rs.user = data.user;
                console.log(rs);
                return rs.auth = true;
            }
        })
        socket.on("signUp", function(data){
            console.log(data);
            if(data.err) return showErr(data.err);
            showInfo(data.status);
        });
        socket.on('login', function(data) {
            console.log(data);
            if(data.err) return showErr(data.err);
            showInfo("Logged in");
            rs.user = data.status;
            document.cookie = "auth="+data.cookie;
            console.log(s);
        });
    }]);
})();