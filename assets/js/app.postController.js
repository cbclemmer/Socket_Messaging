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
                    if(data[i].multi){
                        if(data[i].validated.length == data[i].users.length){
                            data[i].valid = true;
                            data.canValidate = false;
                        }else{
                            data[i].canValidate = true;
                            for(var ii=0;ii<data[i].validated.length;ii++){
                                if(data[i].validated[ii].username == rs.user.username){
                                    data[i].canValidate = false;
                                }
                            }
                        }
                    }else{
                        if(data[i].validated[0].username!=rs.user.username){
                            data[i].canValidate = true;
                        }
                    }
                }
                rs.convs.push(data[i]);
            }
        });
        socket.on("validate", function(data) {
            if(data.err) return showErr(data.err);
            for(var i=0;i<rs.convs.length;i++){
                if(rs.convs[i]._id==data.conv._id){
                    if(rs.convs[i].multi){
                        if(data.conv.validated.length == data.conv.users.length){
                                rs.convs[i].valid = true;
                                rs.convs[i].canValidate = false;
                        }else{
                            if(data.user == rs.user.username){
                                rs.convs[i].canValidate = false;
                            }
                        }
                    }else{
                        rs.convs[i].valid = true;
                        rs.convs[i].canValidate = false;
                    }
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