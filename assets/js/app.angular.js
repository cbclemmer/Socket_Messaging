(function(){
    var app = angular.module("app", []);
    app.controller("userController", ['$scope', '$rootScope', function(s, rs){
        rs.auth = false;
    }]);
    app.controller("loginController", ['$http', '$scope', '$rootScope', function(h, s, rs){
        rs.signUp = false;
        this.ex = "hi"
        this.temp = {};
        this.login = function(user, pass){
            console.log("yes");
        };
        this.signUp = function(user, email, pass, cpass){
            console.log("signing up");
            if(pass == cpass){
                socket.emit("signUp", {
                    username: user,
                    email: email,
                    password: pass
                });
            }else{
                showErr("Passwords do not match")
            }
        };
        this.toggleSign = function(){
            rs.signUp = !rs.signUp;
        }
        socket.on("signUp", function(data){
            console.log(data);
            if(data.status){
                showInfo("Signed up successfully, please log in");
            }else{
                showErr("Something went wrong");
            }
        });
    }]);
})();