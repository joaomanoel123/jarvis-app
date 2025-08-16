/**
 * Jarvis Text-to-Speech Module - Versão API Render
 * Integração com sua API do Render (Google TTS)
 */

class JarvisTTS {
    constructor() {
        // URL da sua API no Render
        this.apiUrl = 'https://jarvis-tdgt.onrender.com'; 
        
        this.isEnabled = true;
        this.currentAudio = null;
        
        // Configurações padrão
        this.settings = {
            voice: {
                languageCode: 'pt-BR',
                name: 'pt-BR-Neural2-A', // Voz feminina Neural2
                ssmlGender: 'FEMALE'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0,
                volumeGainDb: 0.0
            },
            autoSpeak: true
        };
        
        this.init();
    }

    init() {
        console.log('🗣️ Inicializando Jarvis TTS com API Render...');
        
        // Carregar configurações salvas
        this.loadSettings();
        
        // Testar conexão com a API
        this.testConnection();
        
        // Adicionar controles de TTS à interface
        this.addTTSControls();
        
        console.log('✅ Jarvis TTS (Render API) inicializado com sucesso');
    }

    async testConnection() {
        try {
            // Fazer um teste simples com a API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: 'teste',
                    voice: this.settings.voice,
                    audioConfig: this.settings.audioConfig
                })
            });
            
            if (response.ok) {
                console.log('✅ Conexão com API Render OK');
            } else {
                console.warn(`⚠️ API Render respondeu com status: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erro ao conectar com API Render:', error);
        }
    }

    // Esta função resolve o erro que você estava tendo
    autoSelectVoice() {
        // Com API do Render, sempre temos vozes disponíveis
        const availableVoices = [
            { languageCode: 'pt-BR', name: 'pt-BR-Neural2-A', ssmlGender: 'FEMALE' },
            { languageCode: 'pt-BR', name: 'pt-BR-Neural2-B', ssmlGender: 'MALE' },
            { languageCode: 'pt-BR', name: 'pt-BR-Standard-A', ssmlGender: 'FEMALE' },
            { languageCode: 'pt-BR', name: 'pt-BR-Standard-B', ssmlGender: 'MALE' },
            { languageCode: 'pt-BR', name: 'pt-BR-Wavenet-A', ssmlGender: 'FEMALE' },
            { languageCode: 'pt-BR', name: 'pt-BR-Wavenet-B', ssmlGender: 'MALE' }
        ];
        
        // Priorizar Neural2 (melhor qualidade)
        const selectedVoice = availableVoices.find(v => v.name.includes('Neural2')) || availableVoices[0];
        
        this.settings.voice = selectedVoice;
        console.log(`🎯 Voz selecionada: ${selectedVoice.name}`);
        
        return selectedVoice;
    }

    async speak(text, customVoice = null) {
        if (!this.isEnabled || !text) {
            return Promise.resolve();
        }

        // Limpar texto
        const cleanText = this.cleanText(text);
        if (!cleanText) {
            return Promise.resolve();
        }

        console.log('🗣️ Enviando para API Render:', cleanText);

        try {
            // Parar áudio anterior se estiver tocando
            this.stop();

            const voice = customVoice || this.settings.voice;
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: cleanText,
                    voice: voice,
                    audioConfig: this.settings.audioConfig
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.audioContent) {
                throw new Error('Resposta da API não contém audioContent');
            }

            // Reproduzir o áudio
            return this.playAudio(data.audioContent);

        } catch (error) {
            console.error('❌ Erro na síntese de voz:', error);
            throw error;
        }
    }

    playAudio(audioContent) {
        return new Promise((resolve, reject) => {
            try {
                // Criar elemento de áudio com o base64
                this.currentAudio = new Audio(`data:audio/mp3;base64,${audioContent}`);
                
                this.currentAudio.onended = () => {
                    console.log('✅ Reprodução concluída');
                    this.currentAudio = null;
                    resolve();
                };
                
                this.currentAudio.onerror = (error) => {
                    console.error('❌ Erro na reprodução:', error);
                    this.currentAudio = null;
                    reject(error);
                };
                
                // Iniciar reprodução
                this.currentAudio.play().then(() => {
                    console.log('🎤 Reproduzindo áudio...');
                }).catch(reject);
                
            } catch (error) {
                console.error('❌ Erro ao criar áudio:', error);
                reject(error);
            }
        });
    }

    cleanText(text) {
        if (!text) return '';
        
        return text
            // Remover emojis comuns
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
            // Remover símbolos específicos
            .replace(/[🤖🗣️📱✅❌⚠️🔄🔍🎯📡📝🌊🔙💬🚫⏱️🔌🎆💾⚙️🎤]/g, '')
            // Limpar múltiplos espaços
            .replace(/\s+/g, ' ')
            .replace(/\n/g, ' ')
            .trim();
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            console.log('⏹️ Reprodução interrompida');
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        this.saveSettings();
        console.log(`🔊 TTS ${this.isEnabled ? 'ativado' : 'desativado'}`);
        
        if (!this.isEnabled) {
            this.stop();
        }
        
        this.updateTTSButton();
    }

    // Função pública para ser chamada pelo main.js
    speakResponse(text) {
        if (this.settings.autoSpeak && this.isEnabled) {
            this.speak(text);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('jarvis_tts_settings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsedSettings };
                console.log('⚙️ Configurações TTS carregadas');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar configurações TTS:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('jarvis_tts_settings', JSON.stringify(this.settings));
            console.log('💾 Configurações TTS salvas');
        } catch (error) {
            console.warn('⚠️ Erro ao salvar configurações TTS:', error);
        }
    }

    addTTSControls() {
        // Adicionar botão de toggle TTS
        const textInputDiv = document.getElementById('TextInput');
        if (textInputDiv) {
            const ttsBtn = document.createElement('button');
            ttsBtn.id = 'TTSBtn';
            ttsBtn.className = 'glow-on-hover';
            ttsBtn.innerHTML = '<i class="bi bi-volume-up"></i>';
            ttsBtn.title = 'Toggle Text-to-Speech';
            ttsBtn.onclick = () => this.toggle();
            
            textInputDiv.appendChild(ttsBtn);
            this.updateTTSButton();
        }
    }

    updateTTSButton() {
        const ttsBtn = document.getElementById('TTSBtn');
        if (ttsBtn) {
            const icon = ttsBtn.querySelector('i');
            if (this.isEnabled) {
                icon.className = 'bi bi-volume-up';
                ttsBtn.style.opacity = '1';
                ttsBtn.title = 'TTS Ativado - Clique para desativar';
            } else {
                icon.className = 'bi bi-volume-mute';
                ttsBtn.style.opacity = '0.5';
                ttsBtn.title = 'TTS Desativado - Clique para ativar';
            }
        }
    }

    async testTTS() {
        const testPhrases = [
            'Olá! Eu sou o Jarvis, seu assistente virtual.',
            'Sistema de voz funcionando perfeitamente.',
            'Como posso ajudá-lo hoje?',
            'Todos os sistemas operacionais.'
        ];
        
        const randomPhrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
        await this.speak(randomPhrase);
    }
}

// Inicializar TTS quando o documento estiver pronto
let jarvisTTS = null;

$(document).ready(function() {
    setTimeout(() => {
        jarvisTTS = new JarvisTTS();
        window.jarvisTTS = jarvisTTS;
        console.log('🎤 Jarvis TTS (Render API) integrado com sucesso!');
    }, 1000);
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JarvisTTS;
}
