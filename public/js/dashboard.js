(function($) {
    "use strict";

    var socket = io();
    $('#send_anxious_message').submit(function(event) {
        if(!validateForm()) {
            return false;
        }
        event.stopPropagation();
        var userInput = $('#user_input');
        socket.emit('anxiety', userInput.val()); //get user input
        userInput.val('');                       //clear user input
        return false;
    });

    socket.on("anxiety", function(data) {
        var parsedData = JSON.parse(data);

        $('#messages').append($('<div style="margin-bottom: 10px;">').html(messageTemplate(parsedData)));

        function messageTemplate(parsedData) {
            var result = '<div class="user">' +
                '<div class="user-image">' +
                '<img src="' + parsedData.photo + '" alt="">' +
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
            alert("Please tell us about your feelings.");
            return false;
        } else if(a.length > 1000) {
            alert("We know you have a lot to share. Try connecting with others privately or shorten your message so we can all share the space!" );
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
    $("div.twitter-seechat").show();
});
twitterFavicon.addEventListener('error', function () {
    // document.getElementById('status').innerHTML = 'Logged into Twitter: No';
    $("div.twitter-signin").show();

});