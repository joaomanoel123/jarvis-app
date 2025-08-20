$(document).ready(function () {

    // ❌ Removido: eel.init()()

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

    // ===== SPEECH RECOGNITION INTEGRATION =====
    let recognition = null;
    let isListening = false;
    let speechSupported = false;

    // Inicializar Speech Recognition
    function initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            speechSupported = true;
            
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'pt-BR';
            recognition.maxAlternatives = 1;
            
            recognition.onstart = () => {
                console.log('🎤 Reconhecimento iniciado');
                isListening = true;
                $("#MicBtn").addClass('listening');
                $(".siri-message").text('Escutando...');
            };
            
            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (finalTranscript) {
                    console.log('🗣️ Reconhecido:', finalTranscript);
                    $(".siri-message").text(`Você disse: "${finalTranscript}"`);
                    
                    // Processa o comando após 500ms
                    setTimeout(() => {
                        PlayAssistant(finalTranscript);
                    }, 500);
                } else if (interimTranscript) {
                    $(".siri-message").text(`Reconhecendo: "${interimTranscript}"`);
                }
            };
            
            recognition.onerror = (event) => {
                console.error('❌ Erro no reconhecimento:', event.error);
                isListening = false;
                $("#MicBtn").removeClass('listening');
                
                if (event.error === 'no-speech') {
                    $(".siri-message").text('Nenhuma fala detectada. Tente novamente.');
                } else if (event.error === 'not-allowed') {
                    $(".siri-message").text('Permissão negada para microfone.');
                } else {
                    $(".siri-message").text('Erro no reconhecimento de voz.');
                }
                
                setTimeout(() => {
                    $("#Oval").attr("hidden", false);
                    $("#SiriWave").attr("hidden", true);
                }, 3000);
            };
            
            recognition.onend = () => {
                console.log('🔇 Reconhecimento finalizado');
                isListening = false;
                $("#MicBtn").removeClass('listening');
            };
        } else {
            console.warn('⚠️ Web Speech API não suportada');
            speechSupported = false;
        }
    }

    // Inicializar Speech Recognition
    initSpeechRecognition();

    // Função para tocar som do assistente (substituindo eel.playAssistantSound)
    function playAssistantSoundWeb() {
        // Som quando ativa o microfone
        console.log('Som do assistente tocaria aqui');
        // Exemplo: new Audio('assets/sounds/assistant.mp3').play();
    }

    // mic button click event - MODIFICADO para Speech Recognition
    $("#MicBtn").click(function () { 
        if (speechSupported) {
            if (isListening) {
                // Para o reconhecimento
                recognition.stop();
            } else {
                // Inicia o reconhecimento
                playAssistantSoundWeb();
                $("#Oval").attr("hidden", true);
                $("#SiriWave").attr("hidden", false);
                
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Erro ao iniciar reconhecimento:', error);
                    $(".siri-message").text('Erro ao acessar microfone.');
                    setTimeout(() => {
                        $("#Oval").attr("hidden", false);
                        $("#SiriWave").attr("hidden", true);
                    }, 2000);
                }
            }
        } else {
            // Fallback se speech não suportado
            $(".siri-message").text('Reconhecimento de voz não suportado neste navegador.');
            setTimeout(() => {
                $("#Oval").attr("hidden", false);
                $("#SiriWave").attr("hidden", true);
            }, 3000);
        }
    });

    // Tecla de atalho J + Meta também usa speech
    function doc_keyUp(e) {
        if (e.key === 'j' && e.metaKey && speechSupported) {
            if (!isListening) {
                playAssistantSoundWeb();
                $("#Oval").attr("hidden", true);
                $("#SiriWave").attr("hidden", false);
                recognition.start();
            }
        }
    }
    document.addEventListener('keyup', doc_keyUp, false);

    // to play assistant 
    function PlayAssistant(message) {
        if (message != "") {
            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            
            // Envia para backend API (Render ou outro)
            const apiUrl = window.FRONT_API_URL || localStorage.getItem('FRONT_API_URL');
            if (apiUrl) {
                // Requisição para comando com configuração de voz
                fetch(apiUrl.replace(/\/$/, '') + '/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message,
                        voice_config: {
                            languageCode: "pt-BR",
                            name: "pt-BR-Neural2-A",
                            ssmlGender: "FEMALE"
                        },
                        audio_config: {
                            audioEncoding: "MP3",
                            speakingRate: 1.0,
                            pitch: 0.0,
                            volumeGainDb: 0.0
                        }
                    })
                }).then(r => r.json()).then(data => {
                    if (data && data.reply) {
                        // Exibe resposta na tela
                        displayAssistantResponse(data.reply);
                        
                        // Reproduz áudio se retornado
                        if (data.audio_base64) {
                            playAudioFromBase64(data.audio_base64);
                        } else if (data.audio_url) {
                            playAudioFromUrl(data.audio_url);
                        }
                    }
                }).catch(err => {
                    console.error('Erro na API:', err);
                    displayAssistantResponse('Desculpe, ocorreu um erro. Tente novamente.');
                });
            } else {
                // ❌ Removido: eel.allCommands(message);
                displayAssistantResponse('Configure a URL da API nas configurações.');
            }
            
            $("#chatbox").val("");
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        }
    }

    // Função para reproduzir áudio do Google TTS (Base64)
    function playAudioFromBase64(audioBase64) {
        const audio = new Audio();
        
        // Converte base64 para URL
        const audioBlob = base64ToBlob(audioBase64, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audio.src = audioUrl;
        audio.preload = 'metadata';
        
        audio.play().then(() => {
            console.log('Reproduzindo áudio do Google TTS');
        }).catch(err => {
            console.log('Erro ao reproduzir áudio:', err);
        });
        
        // Limpa URL quando terminar
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
            setTimeout(() => {
                $("#Oval").attr("hidden", false);
                $("#SiriWave").attr("hidden", true);
            }, 1000);
        });
        
        audio.addEventListener('error', (e) => {
            console.log('Erro no áudio:', e);
            URL.revokeObjectURL(audioUrl);
        });
    }
    
    // Função para reproduzir áudio via URL direta
    function playAudioFromUrl(audioUrl) {
        const audio = new Audio(audioUrl);
        
        audio.play().then(() => {
            console.log('Reproduzindo áudio via URL');
        }).catch(err => {
            console.log('Erro ao reproduzir áudio:', err);
        });
        
        audio.addEventListener('ended', () => {
            setTimeout(() => {
                $("#Oval").attr("hidden", false);
                $("#SiriWave").attr("hidden", true);
            }, 1000);
        });
    }
    
    // Função auxiliar para converter base64 para blob
    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    // Função para lidar com ações específicas do Jarvis
    function handleJarvisAction(action, params) {
        console.log('Ação do Jarvis:', action, params);
        
        switch(action) {
            case 'open_website':
                if (params && params.url) {
                    window.open(params.url, '_blank');
                }
                break;
                
            case 'search_web':
                if (params && params.query) {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(params.query)}`, '_blank');
                }
                break;
                
            case 'play_music':
                if (params && params.song) {
                    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(params.song)}`, '_blank');
                }
                break;
                
            case 'weather':
                // Já processado pelo Groq, apenas exibe
                break;
                
            case 'time':
                // Já processado pelo Groq, apenas exibe
                break;
                
            case 'news':
                // Pode abrir portal de notícias se necessário
                break;
                
            default:
                console.log('Ação não reconhecida:', action);
        }
    }

    // Função para configurações avançadas do Jarvis
    function configureJarvisSettings() {
        const settings = {
            voice: {
                language: localStorage.getItem('jarvis_language') || 'pt-BR',
                voice_name: localStorage.getItem('jarvis_voice') || 'pt-BR-Neural2-A',
                speed: parseFloat(localStorage.getItem('jarvis_speed')) || 1.0,
                pitch: parseFloat(localStorage.getItem('jarvis_pitch')) || 0.0
            },
            groq: {
                model: localStorage.getItem('jarvis_model') || 'mixtral-8x7b-32768',
                temperature: parseFloat(localStorage.getItem('jarvis_temperature')) || 0.7
            }
        };
        
        return settings;
    }

    // Função para exibir resposta do assistente
    function displayAssistantResponse(response) {
        // Atualiza texto na tela
        $('.siri-message').text(response);
        
        // Não define timeout aqui - será controlado pelo evento 'ended' do áudio
    }

    // toggle function to hide and display mic and send button 
    function ShowHideButton(message) {
        if (message.length == 0) {
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        } else {
            $("#MicBtn").attr('hidden', true);
            $("#SendBtn").attr('hidden', false);
        }
    }

    // key up event handler on text box
    $("#chatbox").keyup(function () {
        let message = $("#chatbox").val();
        ShowHideButton(message);
    });
    
    // send button event handler
    $("#SendBtn").click(function () {
        let message = $("#chatbox").val();
        PlayAssistant(message);
    });

    // settings button: configure backend URL and Jarvis settings
    $("#SettingsBtn").click(function () {
        const currentUrl = localStorage.getItem('FRONT_API_URL') || '';
        const currentVoice = localStorage.getItem('jarvis_voice') || 'pt-BR-Neural2-A';
        const currentSpeed = localStorage.getItem('jarvis_speed') || '1.0';
        
        const settingsHtml = `
            <div style="font-family: Arial; line-height: 1.6;">
                <h3>Configurações do Jarvis</h3>
                <label>URL da API (Render):</label><br>
                <input type="text" id="api-url" value="${currentUrl}" style="width: 300px; margin: 5px 0;"><br><br>
                
                <label>Voz do Google TTS:</label><br>
                <select id="voice-select" style="width: 200px; margin: 5px 0;">
                    <option value="pt-BR-Neural2-A" ${currentVoice === 'pt-BR-Neural2-A' ? 'selected' : ''}>Neural2-A (Feminina)</option>
                    <option value="pt-BR-Neural2-B" ${currentVoice === 'pt-BR-Neural2-B' ? 'selected' : ''}>Neural2-B (Masculina)</option>
                    <option value="pt-BR-Neural2-C" ${currentVoice === 'pt-BR-Neural2-C' ? 'selected' : ''}>Neural2-C (Feminina)</option>
                </select><br><br>
                
                <label>Velocidade da Fala:</label><br>
                <input type="range" id="speed-range" min="0.5" max="2.0" step="0.1" value="${currentSpeed}" style="margin: 5px 0;">
                <span id="speed-value">${currentSpeed}</span><br><br>
                
                <button onclick="saveJarvisSettings()">Salvar</button>
                <button onclick="testJarvisVoice()">Testar Voz</button>
            </div>
        `;
        
        // Cria modal simples (você pode melhorar com CSS)
        const modal = document.createElement('div');
        modal.innerHTML = settingsHtml;
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; border: 2px solid #333;
            border-radius: 10px; z-index: 1000; box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        
        // Overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 999;
        `;
        
        overlay.onclick = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };
        
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        // Update speed display
        modal.querySelector('#speed-range').oninput = function() {
            modal.querySelector('#speed-value').textContent = this.value;
        };
        
        // Global functions for modal
        window.saveJarvisSettings = () => {
            const url = modal.querySelector('#api-url').value.trim();
            const voice = modal.querySelector('#voice-select').value;
            const speed = modal.querySelector('#speed-range').value;
            
            if (url) {
                localStorage.setItem('FRONT_API_URL', url);
            } else {
                localStorage.removeItem('FRONT_API_URL');
            }
            
            localStorage.setItem('jarvis_voice', voice);
            localStorage.setItem('jarvis_speed', speed);
            
            alert('Configurações salvas!');
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };
        
        window.testJarvisVoice = () => {
            const voice = modal.querySelector('#voice-select').value;
            const speed = modal.querySelector('#speed-range').value;
            
            // Testa a voz com as configurações atuais
            const testMessage = "Olá, esta é a voz do Jarvis configurada.";
            displayAssistantResponse(testMessage);
            
            // Simula teste de TTS (você pode implementar endpoint específico)
            console.log(`Testando voz: ${voice} com velocidade: ${speed}`);
        };
    });

    // enter press event handler on chat box
    $("#chatbox").keypress(function (e) {
        key = e.which;
        if (key == 13) {
            let message = $("#chatbox").val();
            PlayAssistant(message);
        }
    });

});