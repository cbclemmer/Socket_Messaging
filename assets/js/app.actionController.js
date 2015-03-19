(function(){
    var app = angular.module("action", []);
    app.controller("actionController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        //show the notifications and ping the server to say that the user has read the notifications
        //basically mark all of the users notifications as read
        this.showNots = function(){
            socket.emit("showNots", getCookie("auth"));
        };
    }]);
})();