(function(){
    var app = angular.module("socke", []);
    app.controller("socketController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        /*
            Post Controller
        */
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
        /*
            Login Controller
        */
        socket.on("auth", function(data) {
            if(data.status&&!rs.auth){
                console.log(data);
                rs.user = data.user;
                rs.auth = true;
                rs.page = "home";
                rs.actions = data.actions;
                window.location.hash = rs.page;
            }
        });
        socket.on("signUp", function(data){
            showInfo(data);
        });
        socket.on('login', function(data) {
            if(data.err){
                $( "#login-email" ).focus();
                return showErr(data.err);
            }
            socket.emit('auth', data.cookie);
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
            rs.once = false;
            document.cookie = "auth=";
            rs.page = "login";
            window.location.hash = rs.page;
        });
        /*
            Message Controller
        */
        socket.on("getMessages", function(data){
            if(data.err) return showErr(data.err);
            for(var i=0;i<$(".post-body").length;i++){
                $(".post-body").scrollTop($(document).height()+10000);
                $(".post-body input").focus();
            }
            for(var i=0;i<data.length;i++){
                if(data[i].username == rs.user.username)
                    data[i].style = {'text-align': 'right'}
                else 
                    data[i].style = {};
            }
            rs.messages = data;
        });
        socket.on("newMess", function(data){
            if(data.err) return showErr(data.err);
            if(data.username == rs.user.username)
                    data.style = {'text-align': 'right'}
                else 
                    data.style = {};
            if(data.conv == rs.currentConv){
                $(".post-body").scrollTop($(document).height()+10000);
                if(data != rs.messages[rs.messages.length-1]){
                    rs.messages.push(data);
                }    
            }
        });
        socket.on("action", function(data){
            if(data.err) return showErr(data.err);
            if(data.from.name!=rs.user.name){
                showInfo(data.text);
                return rs.actions.push(data);
            }
        });
        /*
            Socket Controller
        */
        socket.on("showNots", function(data){
           setTimeout(function(){
               rs.actions = [];
           }, 5000);
        });
        socket.on("errorr", function(data){
           showErr(data); 
        });
    }]);
})();