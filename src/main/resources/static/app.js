let stompClient = null;
let socket = null;
let shortName = "";
sessionStorage.clear();

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    } else {
        $("#conversation").hide();
    }
    $("#chatMessages").html("");
}

function connect() {
    // create the SockJS WebSocket-like object
    socket = new SockJS('/realtime-chat');

    // specify that we're using the STOMP protocol on the socket
    stompClient = Stomp.over(socket);

    // implement the behavior we want whenever the client connects to the server (-or- user connects to chat app client by joining a group)
    stompClient.connect({}, function (frame) {
        setConnected(true);
        sessionStorage.setItem("username", $("#shortName").val());
        console.log('Connected: ' + frame);

        // subscribe to topic and create the callback function that handles updates from the server
        stompClient.subscribe("/topic/guestnames", function (greeting) {
            showJoinedName(JSON.parse(greeting.body).content);
        });

        stompClient.subscribe("/topic/guestchats", function (greeting) {
            showMessage(JSON.parse(greeting.body).content);
        });

        stompClient.subscribe('/topic/guestupdates', function (greeting) {
            showTyping(JSON.parse(greeting.body).content);
        });

        stompClient.subscribe('/topic/errors', function (greeting) {
            showErrors(JSON.parse(greeting.body).content);
        });

        sendName();
    });

}

function disconnect() {
    if (stompClient !== null) {
        $("#members").append("<tr><td>" + shortName + " just left</td></tr>");
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function showTyping(message) {
    $("#typingUpdates").text(message);
}

function sendMessage() {
    stompClient.send("/app/guestchat", {}, JSON.stringify({
        message: $("#message").val(),
        senderName: sessionStorage.getItem("username")
    }));
}

function showMessage(message) {
    $("#chatMessages").append("<tr><td>" + message + "</td></tr>");
    $("#typingUpdates").html("&nbsp;");
    $("#message").val("");
}

function sendName() {
    const $shortName = $("#shortName");
    stompClient.send("/app/guestjoin", {}, JSON.stringify({message: $shortName.val()}));
    $shortName.val("");
}

function showJoinedName(message) {
    $("#members").append("<tr><td>" + message + " just joined</td></tr>");
}

function showErrors(message) {
    $("#errorMessages").text(message);
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });

    $("#connect").click(function () {
        connect();
    });

    $("#disconnect").click(function () {
        disconnect();
    });

    $("#send").click(function () {
        sendMessage();
    });

    $("#message").keyup(function () {
        stompClient.send("/app/guestupdate", {}, JSON.stringify({message: $("#message").val()}));
    });
});

