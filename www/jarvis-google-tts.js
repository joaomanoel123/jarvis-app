/**
 * Jarvis Google Cloud Text-to-Speech Module
 * Integração com Google Cloud TTS API
 * Compatível com GitHub Pages e sistema local
 */

class JarvisGoogleTTS {
    constructor() {
        this.apiKey = null;
        this.isEnabled = false;
        this.isSupported = true;
        this.currentAudio = null;
        this.settings = {
            languageCode: 'pt-BR',
            voiceName: 'pt-BR-Standard-A', // Voz feminina padrão
            ssmlGender: 'FEMALE',
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0,
            volumeGainDb: 0.0,
            autoSpeak: true,
            fallbackToNative: true // Usar TTS nativo se Google falhar
        };
        
        // Vozes disponíveis do Google Cloud TTS para português
        this.availableVoices = {
            'pt-BR': {
                'pt-BR-Standard-A': { gender: 'FEMALE', type: 'Standard', description: 'Voz feminina padrão' },
                'pt-BR-Standard-B': { gender: 'MALE', type: 'Standard', description: 'Voz masculina padrão' },
                'pt-BR-Standard-C': { gender: 'FEMALE', type: 'Standard', description: 'Voz feminina alternativa' },
                'pt-BR-Wavenet-A': { gender: 'FEMALE', type: 'WaveNet', description: 'Voz feminina premium' },
                'pt-BR-Wavenet-B': { gender: 'MALE', type: 'WaveNet', description: 'Voz masculina premium' },
                'pt-BR-Wavenet-C': { gender: 'FEMALE', type: 'WaveNet', description: 'Voz feminina premium alt.' },
                'pt-BR-Neural2-A': { gender: 'FEMALE', type: 'Neural2', description: 'Voz neural feminina' },
                'pt-BR-Neural2-B': { gender: 'MALE', type: 'Neural2', description: 'Voz neural masculina' },
                'pt-BR-Neural2-C': { gender: 'FEMALE', type: 'Neural2', description: 'Voz neural feminina alt.' }
            }
        };
        
        this.init();
    }

    init() {
        console.log('🌐 Inicializando Google Cloud TTS...');
        
        // Carregar configurações salvas
        this.loadSettings();
        
        // Verificar se há API key configurada
        this.checkApiKey();
        
        // Adicionar controles à interface
        this.addGoogleTTSControls();
        
        console.log('✅ Google Cloud TTS inicializado');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('jarvis_google_tts_settings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsedSettings };
                console.log('⚙️ Configurações Google TTS carregadas');
            }
            
            // Carregar API key
            this.apiKey = localStorage.getItem('jarvis_google_tts_api_key');
            if (this.apiKey) {
                this.isEnabled = true;
                console.log('🔑 API Key do Google TTS carregada');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar configurações Google TTS:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('jarvis_google_tts_settings', JSON.stringify(this.settings));
            if (this.apiKey) {
                localStorage.setItem('jarvis_google_tts_api_key', this.apiKey);
            }
            console.log('💾 Configurações Google TTS salvas');
        } catch (error) {
            console.warn('⚠️ Erro ao salvar configurações Google TTS:', error);
        }
    }

    checkApiKey() {
        if (!this.apiKey) {
            console.log('🔑 API Key do Google Cloud TTS não configurada');
            this.isEnabled = false;
        }
    }

    async speak(text, options = {}) {
        if (!text || !text.trim()) {
            return Promise.resolve();
        }

        const cleanText = this.cleanText(text);
        if (!cleanText) {
            return Promise.resolve();
        }

        console.log('🗣️ Google TTS falando:', cleanText);

        // Se Google TTS não estiver disponível, usar fallback
        if (!this.isEnabled || !this.apiKey) {
            if (this.settings.fallbackToNative && window.jarvisTTS) {
                console.log('🔄 Usando TTS nativo como fallback');
                return window.jarvisTTS.speak(cleanText, options);
            }
            return Promise.resolve();
        }

        try {
            // Parar áudio anterior
            this.stop();

            // Preparar dados para a API
            const requestData = {
                input: { text: cleanText },
                voice: {
                    languageCode: options.languageCode || this.settings.languageCode,
                    name: options.voiceName || this.settings.voiceName,
                    ssmlGender: options.ssmlGender || this.settings.ssmlGender
                },
                audioConfig: {
                    audioEncoding: this.settings.audioEncoding,
                    speakingRate: options.speakingRate || this.settings.speakingRate,
                    pitch: options.pitch || this.settings.pitch,
                    volumeGainDb: options.volumeGainDb || this.settings.volumeGainDb
                }
            };

            // Fazer requisição para Google Cloud TTS
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Google TTS API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.audioContent) {
                throw new Error('Nenhum conteúdo de áudio retornado pela API');
            }

            // Converter base64 para blob e reproduzir
            await this.playAudioFromBase64(data.audioContent);
            
            console.log('✅ Google TTS reproduzido com sucesso');
            
        } catch (error) {
            console.error('❌ Erro no Google TTS:', error);
            
            // Usar fallback se configurado
            if (this.settings.fallbackToNative && window.jarvisTTS) {
                console.log('🔄 Usando TTS nativo como fallback após erro');
                return window.jarvisTTS.speak(cleanText, options);
            }
            
            throw error;
        }
    }

    async playAudioFromBase64(base64Audio) {
        return new Promise((resolve, reject) => {
            try {
                // Converter base64 para blob
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const blob = new Blob([bytes], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(blob);
                
                // Criar elemento de áudio
                this.currentAudio = new Audio(audioUrl);
                
                this.currentAudio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    resolve();
                };
                
                this.currentAudio.onerror = (error) => {
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    reject(new Error('Erro ao reproduzir áudio'));
                };
                
                // Reproduzir áudio
                this.currentAudio.play();
                
            } catch (error) {
                reject(error);
            }
        });
    }

    cleanText(text) {
        if (!text) return '';
        
        return text
            // Remover emojis
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            // Remover símbolos específicos
            .replace(/[🤖🗣️📱✅❌⚠️🔄🔍🎯📡📝🌊🔙💬🚫⏱️🔌🎆💾⚙️🎤🌐🔑]/g, '')
            // Limpar espaços
            .replace(/\s+/g, ' ')
            .replace(/\n/g, ' ')
            .trim();
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            console.log('⏹️ Google TTS interrompido');
        }
    }

    pause() {
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            console.log('⏸️ Google TTS pausado');
        }
    }

    resume() {
        if (this.currentAudio && this.currentAudio.paused) {
            this.currentAudio.play();
            console.log('▶️ Google TTS retomado');
        }
    }

    toggle() {
        if (!this.apiKey) {
            this.setupApiKey();
            return;
        }
        
        this.isEnabled = !this.isEnabled;
        this.saveSettings();
        console.log(`🌐 Google TTS ${this.isEnabled ? 'ativado' : 'desativado'}`);
        
        if (!this.isEnabled) {
            this.stop();
        }
        
        this.updateGoogleTTSButton();
    }

    setupApiKey() {
        const instructions = `
🔑 CONFIGURAÇÃO DA API KEY DO GOOGLE CLOUD TTS

📋 PASSOS:

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Ative a API "Cloud Text-to-Speech"
4. Vá em "Credenciais" > "Criar credenciais" > "Chave de API"
5. Copie a chave gerada

💰 COTA GRATUITA:
• Standard: 4 milhões de caracteres/mês GRÁTIS
• WaveNet/Neural2: 1 milhão de caracteres/mês GRÁTIS

🔒 SEGURANÇA:
• Restrinja a chave apenas para Text-to-Speech API
• Configure restrições de domínio se necessário
        `;
        
        alert(instructions);
        
        const apiKey = prompt('🔑 Cole sua API Key do Google Cloud TTS:');
        
        if (apiKey && apiKey.trim()) {
            this.apiKey = apiKey.trim();
            this.isEnabled = true;
            this.saveSettings();
            alert('✅ API Key configurada com sucesso!\n\n🧪 Teste agora usando o menu de configurações.');
            this.updateGoogleTTSButton();
        }
    }

    addGoogleTTSControls() {
        // Adicionar botão de toggle Google TTS
        const textInputDiv = document.getElementById('TextInput');
        if (textInputDiv) {
            const googleTtsBtn = document.createElement('button');
            googleTtsBtn.id = 'GoogleTTSBtn';
            googleTtsBtn.className = 'glow-on-hover';
            googleTtsBtn.innerHTML = '<i class="bi bi-cloud"></i>';
            googleTtsBtn.title = 'Google Cloud TTS';
            googleTtsBtn.onclick = () => this.toggle();
            
            textInputDiv.appendChild(googleTtsBtn);
            this.updateGoogleTTSButton();
        }

        // Integrar com menu de configurações existente
        this.integrateWithSettings();
    }

    updateGoogleTTSButton() {
        const googleTtsBtn = document.getElementById('GoogleTTSBtn');
        if (googleTtsBtn) {
            const icon = googleTtsBtn.querySelector('i');
            
            if (!this.apiKey) {
                icon.className = 'bi bi-cloud-slash';
                googleTtsBtn.style.opacity = '0.3';
                googleTtsBtn.title = 'Google TTS - Clique para configurar API Key';
            } else if (this.isEnabled) {
                icon.className = 'bi bi-cloud-check';
                googleTtsBtn.style.opacity = '1';
                googleTtsBtn.style.color = '#00ff88';
                googleTtsBtn.title = 'Google TTS Ativo - Clique para desativar';
            } else {
                icon.className = 'bi bi-cloud';
                googleTtsBtn.style.opacity = '0.5';
                googleTtsBtn.style.color = '';
                googleTtsBtn.title = 'Google TTS Inativo - Clique para ativar';
            }
        }
    }

    integrateWithSettings() {
        // Adicionar opções do Google TTS ao menu principal
        const originalShowJarvisSettings = window.showJarvisSettings;
        
        window.showJarvisSettings = () => {
            const options = [
                '🔧 Configurar URL da API',
                '🎤 Configurações de Voz',
                '🌐 Google Cloud TTS',
                '🧪 Testar Microfone',
                '🔊 Testar Text-to-Speech',
                '📊 Diagnóstico do Sistema',
                '📝 Ver Logs do Console',
                '❌ Cancelar'
            ];
            
            const choice = prompt(`Configurações do Jarvis:\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEscolha uma opção (1-${options.length}):`);
            
            switch(choice) {
                case '3':
                    this.showGoogleTTSSettings();
                    break;
                default:
                    // Chamar função original para outras opções
                    if (originalShowJarvisSettings) {
                        // Ajustar índice para função original
                        const adjustedChoice = choice <= '2' ? choice : (parseInt(choice) - 1).toString();
                        originalShowJarvisSettings(adjustedChoice);
                    }
                    break;
            }
        };
    }

    showGoogleTTSSettings() {
        const status = this.apiKey ? (this.isEnabled ? '✅ Ativo' : '⏸️ Inativo') : '❌ Não configurado';
        const currentVoice = this.availableVoices[this.settings.languageCode][this.settings.voiceName];
        
        const options = [
            `📊 Status: ${status}`,
            `🔑 ${this.apiKey ? 'Reconfigurar' : 'Configurar'} API Key`,
            `🎤 Voz: ${this.settings.voiceName} (${currentVoice.description})`,
            `⚡ Velocidade: ${this.settings.speakingRate}`,
            `🎵 Tom: ${this.settings.pitch}`,
            `🔊 Volume: ${this.settings.volumeGainDb}dB`,
            `🔄 Fallback TTS Nativo: ${this.settings.fallbackToNative ? 'Sim' : 'Não'}`,
            '🧪 Testar Google TTS',
            '📊 Verificar Cota',
            '🔄 Resetar Configurações',
            '❌ Voltar'
        ];
        
        const choice = prompt(`Google Cloud Text-to-Speech:\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEscolha uma opção (1-${options.length}):`);
        
        switch(choice) {
            case '2':
                this.setupApiKey();
                break;
            case '3':
                this.selectGoogleVoice();
                break;
            case '4':
                this.adjustSpeakingRate();
                break;
            case '5':
                this.adjustPitch();
                break;
            case '6':
                this.adjustVolumeGain();
                break;
            case '7':
                this.toggleFallback();
                break;
            case '8':
                this.testGoogleTTS();
                break;
            case '9':
                this.checkQuota();
                break;
            case '10':
                this.resetGoogleSettings();
                break;
            default:
                return;
        }
    }

    selectGoogleVoice() {
        const voices = this.availableVoices[this.settings.languageCode];
        const voiceOptions = Object.entries(voices).map(([name, info], index) => 
            `${index + 1}. ${name} - ${info.description} (${info.type})`
        );
        
        const choice = prompt(`Selecione uma voz do Google:\n\n${voiceOptions.join('\n')}\n\nDigite o número da voz:`);
        
        const voiceIndex = parseInt(choice) - 1;
        const voiceNames = Object.keys(voices);
        
        if (voiceIndex >= 0 && voiceIndex < voiceNames.length) {
            const selectedVoice = voiceNames[voiceIndex];
            this.settings.voiceName = selectedVoice;
            this.settings.ssmlGender = voices[selectedVoice].gender;
            this.saveSettings();
            alert(`✅ Voz selecionada: ${selectedVoice}`);
            this.testGoogleTTS();
        }
    }

    adjustSpeakingRate() {
        const newRate = prompt(`Velocidade da fala (0.25 - 4.0):\n\nAtual: ${this.settings.speakingRate}\n\nDigite a nova velocidade:`, this.settings.speakingRate);
        const rate = parseFloat(newRate);
        
        if (!isNaN(rate) && rate >= 0.25 && rate <= 4.0) {
            this.settings.speakingRate = rate;
            this.saveSettings();
            alert(`✅ Velocidade ajustada para: ${rate}`);
            this.testGoogleTTS();
        } else if (newRate !== null) {
            alert('❌ Valor inválido. Use um número entre 0.25 e 4.0');
        }
    }

    adjustPitch() {
        const newPitch = prompt(`Tom da voz (-20.0 a 20.0):\n\nAtual: ${this.settings.pitch}\n\nDigite o novo tom:`, this.settings.pitch);
        const pitch = parseFloat(newPitch);
        
        if (!isNaN(pitch) && pitch >= -20.0 && pitch <= 20.0) {
            this.settings.pitch = pitch;
            this.saveSettings();
            alert(`✅ Tom ajustado para: ${pitch}`);
            this.testGoogleTTS();
        } else if (newPitch !== null) {
            alert('❌ Valor inválido. Use um número entre -20.0 e 20.0');
        }
    }

    adjustVolumeGain() {
        const newVolume = prompt(`Ganho de volume (-96.0 a 16.0 dB):\n\nAtual: ${this.settings.volumeGainDb}dB\n\nDigite o novo ganho:`, this.settings.volumeGainDb);
        const volume = parseFloat(newVolume);
        
        if (!isNaN(volume) && volume >= -96.0 && volume <= 16.0) {
            this.settings.volumeGainDb = volume;
            this.saveSettings();
            alert(`✅ Ganho de volume ajustado para: ${volume}dB`);
            this.testGoogleTTS();
        } else if (newVolume !== null) {
            alert('❌ Valor inválido. Use um número entre -96.0 e 16.0');
        }
    }

    toggleFallback() {
        this.settings.fallbackToNative = !this.settings.fallbackToNative;
        this.saveSettings();
        alert(`✅ Fallback para TTS nativo ${this.settings.fallbackToNative ? 'ativado' : 'desativado'}`);
    }

    testGoogleTTS() {
        if (!this.isEnabled || !this.apiKey) {
            alert('❌ Google TTS não está configurado. Configure a API Key primeiro.');
            return;
        }
        
        const testPhrases = [
            'Olá! Eu sou o Jarvis com Google Cloud Text-to-Speech.',
            'Sistema de voz premium funcionando perfeitamente.',
            'Qualidade de áudio superior com tecnologia Google.',
            'Como posso ajudá-lo hoje?'
        ];
        
        const randomPhrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
        this.speak(randomPhrase).catch(error => {
            alert(`❌ Erro no teste: ${error.message}`);
        });
    }

    checkQuota() {
        const info = `
📊 INFORMAÇÕES DE COTA GOOGLE CLOUD TTS

💰 COTA GRATUITA MENSAL:
• Standard: 4.000.000 caracteres
• WaveNet/Neural2: 1.000.000 caracteres
• Studio: 1.000.000 caracteres

💵 PREÇOS APÓS COTA:
• Standard: $4.00 por 1M caracteres
• WaveNet/Neural2: $16.00 por 1M caracteres
• Studio: $160.00 por 1M caracteres

📈 VERIFICAR USO:
1. Acesse: https://console.cloud.google.com/
2. Vá em "Faturamento" > "Relatórios"
3. Filtre por "Cloud Text-to-Speech API"

🔗 DOCUMENTAÇÃO:
https://cloud.google.com/text-to-speech/pricing
        `;
        
        alert(info);
    }

    resetGoogleSettings() {
        if (confirm('🔄 Resetar todas as configurações do Google TTS?\n\n⚠️ Isso NÃO removerá sua API Key.')) {
            const apiKey = this.apiKey; // Preservar API key
            
            this.settings = {
                languageCode: 'pt-BR',
                voiceName: 'pt-BR-Standard-A',
                ssmlGender: 'FEMALE',
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0,
                volumeGainDb: 0.0,
                autoSpeak: true,
                fallbackToNative: true
            };
            
            this.apiKey = apiKey; // Restaurar API key
            this.saveSettings();
            alert('✅ Configurações do Google TTS resetadas!');
        }
    }

    // Método público para ser chamado pelo main.js
    speakResponse(text) {
        if (this.settings.autoSpeak && this.isEnabled && this.apiKey) {
            this.speak(text).catch(error => {
                console.error('❌ Erro no Google TTS:', error);
            });
        }
    }
}

// Inicializar Google TTS quando o documento estiver pronto
let jarvisGoogleTTS = null;

$(document).ready(function() {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
        jarvisGoogleTTS = new JarvisGoogleTTS();
        
        // Tornar disponível globalmente
        window.jarvisGoogleTTS = jarvisGoogleTTS;
        
        console.log('🌐 Jarvis Google Cloud TTS integrado com sucesso!');
    }, 1500);
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JarvisGoogleTTS;
}