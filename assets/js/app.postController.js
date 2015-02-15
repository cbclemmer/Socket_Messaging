(function(){
    var app = angular.module("post", []);
    app.controller("postController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        //send request to talk
        if(!rs.convs){
            rs.convs = [];
        }
        this.request = function(username){
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
            socket.emit("delet", {id: id, conv: conv, cookie: getCookie("auth")});
        }
        socket.on("request", function(data){
            if(data.err) return showErr(data.err);
            if(data.conv[0].users.length > 2) {
                data.conv[0].multi = true;
            }else{
                if(data.conv[0].users[0].username==rs.user.username){
                    data.conv[0].other = 1;
                }else{
                    data.conv[0].other = 0;
                }
            }
            rs.convs.push(data.conv[0]);
        });
        socket.on("convs", function(data){
            for(var i=0;i<data.length;i++){
                if(data[i].users.length > 2) {
                    data[i].multi = true;
                }else{
                    if(data[i].users[0].username==rs.user.username){
                        data[i].other = 1;
                    }else{
                        data[i].other = 0;
                    }
                }
                if(data[i].validated.length>1&&!data[i].multi) {
                    data[i].valid = true;
                }else{
                    if(data[i].validated[0].username!=rs.user.username){
                        data[i].canValidate = true;
                    }
                }
                rs.convs.push(data[i]);
            }
        });
        socket.on("validate", function(data) {
            if(data.err) return showErr(data.err);
            for(var i=0;i<rs.convs.length;i++){
                if(rs.convs[i].id==data.status){
                    rs.convs[i].valid = true;
                    rs.convs[i].canValidate = false;
                }
            }
        });
        socket.on("reject", function(data){
            if(data.err) return showErr(data.err);
            if(data.reject == rs.user._id || data.users.length < 3){
                for(var i=0;i<rs.convs.length;i++){
                    if(rs.convs[i]._id == data._id){
                        rs.convs.splice(i, 1);
                    }
                }
            }
        });
        socket.on("delet", function(data){
            if(data.err) return showErr(data.err);
            if(data.delet == rs.user._id || data.users.length < 3){
                for(var i=0;i<rs.convs.length;i++){
                    if(rs.convs[i]._id == data._id){
                        rs.convs.splice(i, 1);
                    }
                }
            }
        });
    }]);
})();