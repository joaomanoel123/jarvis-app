$(document).ready(function () {

    // GitHub Pages compatible controller
    // Removed eel dependencies for web compatibility

    // Display Speak Message
    function DisplayMessage(message) {
        $(".siri-message li:first").text(message);
        if (typeof $('.siri-message').textillate === 'function') {
            $('.siri-message').textillate('start');
        }
    }

    // Display hood
    function ShowHood() {
        $("#Oval").attr("hidden", false);
        $("#SiriWave").attr("hidden", true);
    }

    function senderText(message) {
        var chatBox = document.getElementById("chat-canvas-body");
        if (message.trim() !== "") {
            chatBox.innerHTML += `<div class="row justify-content-end mb-4">
            <div class = "width-size">
            <div class="sender_message">${message}</div>
        </div>`; 
    
            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    function receiverText(message) {
        var chatBox = document.getElementById("chat-canvas-body");
        if (message.trim() !== "") {
            chatBox.innerHTML += `<div class="row justify-content-start mb-4">
            <div class = "width-size">
            <div class="receiver_message">${message}</div>
            </div>
        </div>`; 
    
            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    // Hide Loader and display Face Auth animation
    function hideLoader() {
        $("#Loader").attr("hidden", true);
        $("#FaceAuth").attr("hidden", false);
    }
    
    // Hide Face auth and display Face Auth success animation
    function hideFaceAuth() {
        $("#FaceAuth").attr("hidden", true);
        $("#FaceAuthSuccess").attr("hidden", false);
    }
    
    // Hide success and display 
    function hideFaceAuthSuccess() {
        $("#FaceAuthSuccess").attr("hidden", true);
        $("#HelloGreet").attr("hidden", false);
    }

    // Hide Start Page and display blob
    function hideStart() {
        $("#Start").attr("hidden", true);

        setTimeout(function () {
            $("#Oval").addClass("animate__animated animate__zoomIn");
        }, 1000)
        
        setTimeout(function () {
            $("#Oval").attr("hidden", false);
        }, 1000)
    }

    // Make functions available globally for GitHub Pages compatibility
    window.DisplayMessage = DisplayMessage;
    window.ShowHood = ShowHood;
    window.senderText = senderText;
    window.receiverText = receiverText;
    window.hideLoader = hideLoader;
    window.hideFaceAuth = hideFaceAuth;
    window.hideFaceAuthSuccess = hideFaceAuthSuccess;
    window.hideStart = hideStart;

    console.log('🎮 Controller carregado para GitHub Pages');
});