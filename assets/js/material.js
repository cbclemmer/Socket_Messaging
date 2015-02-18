jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};
$(document).ready(function(){
	var i = screen.height;
	$("#sideNav").css({height: (i+"px")});
	$("#shadow").css({height: (i+"px")});
	$("#search").click(function(){
		if($("#searchBar").is(":visible")){
			$("#searchBar").animate({top: "-200px"}, 500, function(){
				$("#searchBar").hide();
			});		
		}else{
			$("#searchBar").show();
			$("#searchBar").animate({top: "0px"}, 500);
		}
	});
	$("#menuButton").click(function(){
		$("#shadow").fadeIn('fast', function(){
			$("#sideNav").css({left: "-20%", display: "none"});
			$("#sideNav").show();
			$("#sideNav").animate({left: "0px"}, 200);			
		});
	});
	$("#shadow").click(function(){
		$("#sideNav").animate({left: "-20%"}, 200, function(){
			$("#sideNav").hide();
			$("#shadow").fadeOut('fast');
		});
	});
	$("#sideNav").click(function(){
		$("#sideNav").animate({left: "-20%"}, 200, function(){
			$("#sideNav").hide();
			$("#shadow").fadeOut('fast');
		});
	});
	$("#searchBar").keyup(function(){
		if($("#searchBar").val()!=""){
			$("#searchResults").slideDown();
		}else{
			$("#searchResults").slideUp();
		}
	});
	$("#newPostButton").click(function(){
		if($("#newPost").is(":visible")) {
			$("#newPostButton").rotate(0);
			$("#newPost").slideUp();
		}else{
			$("#newPostButton").rotate(45);
			$("#newPost").slideDown();
			$("#newPost input").focus();
		}
	});
	$("#aboutButton").click(function(){
		if($("#aboutDiv").is(":visible")){
			$("#aboutDiv").slideUp();
		}else{
			$("#aboutDiv").slideDown();
		}
	});
	$(".main").click(function(){
		$("#newPostButton").rotate(0);
		$("#newPost").slideUp();
	});
	$("#aboutFriends").click(function(){
		$("#friendsDiv").css({right: "-70%"});
		$("#friendsDiv").show();
		$("#friendsDiv").animate({right: "5%"});
		$("#aboutDiv").slideUp();
	});
	$("#friendsExit").click(function(){
		$("#friendsDiv").animate({right: "-70%"}, 500, function(){
			$("#friendsDiv").hide();
		});
	});
	$(".no").click(function(){
		$("#sure").fadeOut('fast', function(){
			$("#shadow").fadeOut('fast');
		});
	});
});