(function(){
    var app = angular.module("app", ['btford.socket-io', 'post', 'login', 'message']);
    app.factory('socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect('http://104.131.176.87:8080/')
        });
    });
    app.controller("userController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        rs.auth = false;
        rs.page = "login";
        window.location.hash = rs.page;
        this.hi = "hello";
    }]);
})();