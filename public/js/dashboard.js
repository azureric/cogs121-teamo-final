(function($) {
    "use strict";

    var socket = io();
    $('form#send_anxious_message').submit(function(event) {
        if(!validateForm()) {
            return false;
        }
        event.stopPropagation();
        var userInput = $('#user_input');
        socket.emit('anxietyChat', userInput.val()); //get user input
        userInput.val('');                       //clear user input
        return false;
    });

    socket.on("anxietyChat", function(data) {
        var parsedData = JSON.parse(data);

        $('#hold-chat').append($('<div>').html(messageTemplate(parsedData))).animate({scrollTop: 99999999999999}, 4000);

        function messageTemplate(parsedData) {
            var result = '<div class="user">' +
                '<div class="user-image">' +
                '<img id="user-image" src="' + parsedData.photo + '" alt="">' +
                '</div>' +
                '<div class="user-info">' +
                '<span class="username">' + parsedData.user + '</span><br/>' +
                '<span class="posted">' + parsedData.posted + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="message-content">' +
                parsedData.message +
                '</div>';
            return result;
        }

    });

    function validateForm() {
        var a=document.forms["Form"]["field1"].value;
        if (a=="" ) {
            // alert("Please tell us your feeling");
            sweetAlert("Please tell us about your feelings.");
            return false;
        } else if(a.length > 1000) {
            sweetAlert("We know you have a lot to share. Try connecting with others privately or shorten your message so we can all share the space!" );
            return false;
        } else {
            return true;
        }
    }
})($);


var twitterFavicon = document.createElement('img');
twitterFavicon.src = '//twitter.com/login?redirect_after_login=%2Ffavicon.ico';
twitterFavicon.addEventListener('load', function () {
    // document.getElementById('status').innerHTML = 'Logged into Twitter: Yes';

    var QueryString = function () {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }();

    console.log('fdsafdsaf' + QueryString.signout == 'true');

    if(QueryString.signout == 'true') {
        $("div.twitter-signin-div").show();
        $("div.twitter-chatfeed").hide();
        $("div.twitter-entermsg").hide();
        $("#logout-btn").hide();
    }
    else{
        $("div.twitter-chatfeed").show();
        $("div.twitter-entermsg").show();
        scrollChat();
        $("#logout-btn").show();
    }
});
twitterFavicon.addEventListener('error', function () {
    // document.getElementById('status').innerHTML = 'Logged into Twitter: No';
    $("div.twitter-signin-div").show();
    $("div.twitter-chatfeed").hide();
    $("div.twitter-entermsg").hide();
    $("#logout-btn").hide();
});

function scrollChat() {
    $('#hold-chat').scroll();
    $("#hold-chat").animate({scrollTop: 99999999999999}, 4000);
}