(function(){
    var app = angular.module("app", ['btford.socket-io', 'post', 'login', 'message', 'action', 'socke']);
    app.factory('socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect('http://104.131.176.87:82/')
        });
    });
    app.controller("userController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        //if the user is authenticated
        rs.auth = false;
        //What page
        rs.page = "login";
        window.location.hash = rs.page;
        this.hi = "hello";
    }]);
})();