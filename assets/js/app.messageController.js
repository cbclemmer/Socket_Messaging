(function(){
    var app = angular.module('message', []);
    app.controller('messageController', ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        if(!rs.messages) rs.messages = [];
        this.getMessages = function(conv){
            if(rs.currentConv == conv){
                rs.currentConv = "";
            }else{
                $(".post-body").height($(window).height()-400);
                for(var i=0;i<rs.convs.length;i++){
                    if(rs.convs[i]._id==conv){
                        break;
                    }
                }
                if(rs.convs[i].valid){
                    rs.currentConv = conv;
                    socket.emit("getMessages", {conv: conv, cookie: getCookie("auth")});
                }
            }
        };
        this.newMess = function(mess, conv){
            s.mess.temp = "";
            socket.emit("newMess", {mess: mess, conv: conv, cookie: getCookie("auth")});
        }
    }]);
})();