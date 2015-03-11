function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 

function showErr(s){
    $('#Err').empty();
    $('#Err').append(s)
    $('#Err').css({top: '-200px'});
    $('#Err').show();
    $('#Err').animate({top: '30px'}, function(){
        $('#Err').fadeOut(3000);
    });
}

function showInfo(s){
    $('#Info').empty();
    $('#Info').append(s)
    $('#Info').css({top: '-200px'});
    $('#Info').show();
    $('#Info').animate({top: '30px'}, function(){
        $('#Info').fadeOut(3000);
    });
}

$(document).ready(function(){
    $(document).click(function(e){
        if($("#Err").is(":visible")||$("#Info").is(":visible")){
            $("#Err").hide();
            $("#Info").hide();
        }
    });
});