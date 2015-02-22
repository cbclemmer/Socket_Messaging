(function(){
    var app = angular.module("post", []);
    app.controller("postController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        //send request to talk
        if(!rs.convs){
            rs.convs = [];
        }
        this.request = function(username){
            username = username.replace(/ /g, "");
            username = username.split(",");
            $("#newPost input").val("");
            $("#newPostButton").rotate(0);
			$("#newPost").slideUp();
            socket.emit("request", {un: username, cookie: getCookie("auth")});
        }
        this.validate = function(id, conv){
            socket.emit("validate", {id: id, conv: conv, cookie: getCookie("auth")});
        }
        this.reject = function(id, conv){
            socket.emit("reject", {id: id, conv: conv, cookie: getCookie("auth")});
        }
        this.delet = function(id, conv){
            $("#sure").fadeOut('fast', function(){
			    $("#shadow").fadeOut('fast');
		    });
            socket.emit("delet", {conv: rs.sure.conv, cookie: getCookie("auth")});
        }
        this.sure = function(type, conv) {
            $("#shadow").fadeIn('fast', function(){
                $("#sure").fadeIn('fast');
            });
            rs.sure = {
                conv: conv
            };
        }
    }]);
})();