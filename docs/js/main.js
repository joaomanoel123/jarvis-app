$(document).ready(function () {

    eel.init()()

    $('.text').textillate({
        loop: true,
        sync: true,
        in: {
            effect: "bounceIn",
        },
        out: {
            effect: "bounceOut",
        },

    });

    // Siri configuration
    var container = document.getElementById("siri-container");
    var sw = new SiriWave({
        container: container,
        width: container.clientWidth || 320,
        height: 160,
        style: "ios9",
        amplitude: 1,
        speed: 0.30,
        autostart: true
      });
      window.addEventListener('resize', function() {
        sw.setWidth(container.clientWidth || 320);
        sw.setHeight(160);
      });

    // Siri message animation
    $('.siri-message').textillate({
        loop: true,
        sync: true,
        in: {
            effect: "fadeInUp",
            sync: true,
        },
        out: {
            effect: "fadeOutUp",
            sync: true,
        },

    });

    // mic button click event
    $("#MicBtn").click(function () { 
        eel.playAssistantSound()
        $("#Oval").attr("hidden", true);
        $("#SiriWave").attr("hidden", false);
        eel.allCommands()()
    });

    function doc_keyUp(e) {
        if (e.key === 'j' && e.metaKey) {
            eel.playAssistantSound()
            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            eel.allCommands()()
        }
    }
    document.addEventListener('keyup', doc_keyUp, false);

    // to play assisatnt 
    function PlayAssistant(message) {
        if (message != "") {
            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            const apiUrl = window.FRONT_API_URL || localStorage.getItem('FRONT_API_URL');
            if (apiUrl) {
                fetch(apiUrl.replace(/\/$/, '') + '/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                }).then(r => r.json()).then(data => {
                    if (data && data.reply) {
                        if (window.eel && window.eel.exposed_functions && window.eel.exposed_functions.receiverText) {
                            window.eel.exposed_functions.receiverText(data.reply);
                        }
                    }
                }).catch(console.error);
            } else {
                eel.allCommands(message);
            }
            $("#chatbox").val("")
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        }
    }

    function ShowHideButton(message) {
        if (message.length == 0) {
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        }
        else {
            $("#MicBtn").attr('hidden', true);
            $("#SendBtn").attr('hidden', false);
        }
    }

    $("#chatbox").keyup(function () {
        let message = $("#chatbox").val();
        ShowHideButton(message)
    });
    
    $("#SendBtn").click(function () {
        let message = $("#chatbox").val()
        PlayAssistant(message)
    });

    $("#SettingsBtn").click(function () {
        const current = localStorage.getItem('FRONT_API_URL') || '';
        const input = prompt('URL do backend (Deta Space). Deixe vazio para desativar.', current);
        if (input === null) return; // cancel
        const trimmed = (input || '').trim();
        if (trimmed === '') {
            localStorage.removeItem('FRONT_API_URL');
            alert('Backend remoto desativado.');
        } else {
            localStorage.setItem('FRONT_API_URL', trimmed);
            alert('Backend configurado: ' + trimmed);
        }
    });
    
    $("#chatbox").keypress(function (e) {
        key = e.which;
        if (key == 13) {
            let message = $("#chatbox").val()
            PlayAssistant(message)
        }
    });

    // Configuração do particles.js sem inline
    particlesJS.load('particles-js', 'particles.json', function() {
        console.log('Particles.js carregado com sucesso!');
    });

    // 🚀 Registro do Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
            .catch(err => console.error('❌ Erro ao registrar o Service Worker:', err));
    }

});
