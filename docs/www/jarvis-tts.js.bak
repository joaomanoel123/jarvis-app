/**
 * Jarvis Text-to-Speech Module
 * Integração de voz para o assistente Jarvis
 * Compatível com GitHub Pages
 */

class JarvisTTS {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;
        this.isSupported = 'speechSynthesis' in window;
        this.isEnabled = true;
        this.settings = {
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
            voiceIndex: -1, // -1 = auto-select
            autoSpeak: true
        };
        
        this.init();
    }

    init() {
        console.log('🗣️ Inicializando Jarvis TTS...');
        
        if (!this.isSupported) {
            console.warn('❌ Text-to-Speech não suportado neste navegador');
            return;
        }

        // Carregar configurações salvas
        this.loadSettings();
        
        // Carregar vozes
        this.loadVoices();
        
        // Recarregar vozes quando disponíveis (alguns navegadores carregam assincronamente)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.loadVoices();
            };
        }

        // Adicionar controles de TTS à interface
        this.addTTSControls();
        
        console.log('✅ Jarvis TTS inicializado com sucesso');
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        console.log(`🎤 ${this.voices.length} vozes carregadas`);
        
        // Auto-selecionar melhor voz em português
        if (this.settings.voiceIndex === -1) {
            this.autoSelectVoice();
        }
    }

    autoSelectVoice() {
        // Priorizar vozes em português brasileiro
        const ptBrVoices = this.voices.filter(voice => 
            voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
        );
        
        // Se não encontrar pt-BR, procurar pt
        const ptVoices = this.voices.filter(voice => 
            voice.lang.startsWith('pt') && !voice.lang.includes('BR')
        );
        
        // Vozes em inglês como fallback
        const enVoices = this.voices.filter(voice => 
            voice.lang.startsWith('en')
        );

        let selectedVoice = null;
        
        if (ptBrVoices.length > 0) {
            // Preferir vozes femininas para Jarvis
            selectedVoice = ptBrVoices.find(v => v.name.toLowerCase().includes('female')) || ptBrVoices[0];
            console.log('🇧🇷 Voz selecionada: Português Brasileiro');
        } else if (ptVoices.length > 0) {
            selectedVoice = ptVoices.find(v => v.name.toLowerCase().includes('female')) || ptVoices[0];
            console.log('🇵🇹 Voz selecionada: Português');
        } else if (enVoices.length > 0) {
            selectedVoice = enVoices.find(v => v.name.toLowerCase().includes('female')) || enVoices[0];
            console.log('🇺🇸 Voz selecionada: Inglês (fallback)');
        }

        if (selectedVoice) {
            this.settings.voiceIndex = this.voices.indexOf(selectedVoice);
            console.log(`🎯 Voz auto-selecionada: ${selectedVoice.name} (${selectedVoice.lang})`);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('jarvis_tts_settings');
            if (saved) {
                try {
                    const parsedSettings = JSON.parse(saved);
                    this.settings = { ...this.settings, ...parsedSettings };
                    console.log('⚙️ Configurações TTS carregadas');
                } catch (parseError) {
                    console.warn('⚠️ Erro ao carregar configurações TTS, usando padrões:', parseError);
                    localStorage.removeItem('jarvis_tts_settings'); // Limpar configuração corrompida
                }
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

    speak(text, options = {}) {
        if (!this.isSupported || !this.isEnabled || !text) {
            return Promise.resolve();
        }

        // Limpar texto
        const cleanText = this.cleanText(text);
        if (!cleanText) {
            return Promise.resolve();
        }

        console.log('🗣️ Falando:', cleanText);

        return new Promise((resolve, reject) => {
            // Garantir que a síntese não está pausada
            this.resume();

            // Parar qualquer fala anterior
            this.stop();

            // Criar nova utterance
            this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
            
            // Configurar voz
            if (this.settings.voiceIndex >= 0 && this.voices[this.settings.voiceIndex]) {
                this.currentUtterance.voice = this.voices[this.settings.voiceIndex];
            }

            // Aplicar configurações
            this.currentUtterance.rate = options.rate || this.settings.rate;
            this.currentUtterance.pitch = options.pitch || this.settings.pitch;
            this.currentUtterance.volume = options.volume || this.settings.volume;

            // Event listeners
            this.currentUtterance.onstart = () => {
                console.log('🎤 Iniciando fala...');
            };

            this.currentUtterance.onend = () => {
                console.log('✅ Fala concluída');
                this.currentUtterance = null;
                resolve();
            };

            this.currentUtterance.onerror = (event) => {
                console.error('❌ Erro na fala:', event.error);
                this.currentUtterance = null;
                reject(new Error(`TTS Error: ${event.error}`));
            };

            // Iniciar fala
            this.synth.speak(this.currentUtterance);
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
            // Remover símbolos especiais específicos
            .replace(/[🤖🗣️📱✅❌⚠️🔄🔍🎯📡📝🌊🔙💬🚫⏱️🔌🎆💾⚙️🎤]/g, '')
            // Limpar múltiplos espaços
            .replace(/\s+/g, ' ')
            // Remover quebras de linha
            .replace(/\n/g, ' ')
            .trim();
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
            this.currentUtterance = null;
            console.log('⏹️ Fala interrompida');
        }
    }

    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            console.log('⏸️ Fala pausada');
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
            console.log('▶️ Fala retomada');
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

    addTTSControls() {
        // Adicionar botão de toggle TTS
        const textInputDiv = document.getElementById('TextInput');
        if (textInputDiv) {
            const ttsBtn = document.createElement('button');
            ttsBtn.id = 'TTSBtn';
            ttsBtn.className = 'glow-on-hover';
            ttsBtn.innerHTML = '<i class=\"bi bi-volume-up\"></i>';
            ttsBtn.title = 'Toggle Text-to-Speech';
            ttsBtn.onclick = () => this.toggle();
            
            textInputDiv.appendChild(ttsBtn);
            this.updateTTSButton();
        }

        // Adicionar configurações TTS ao menu de configurações
        this.addTTSSettings();
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

    addTTSSettings() {
        // Interceptar o clique do botão de configurações para adicionar opções TTS
        const originalSettingsHandler = window.jarvisSettingsHandler;
        
        window.jarvisSettingsHandler = () => {
            const options = [
                '🔧 Configurar URL da API',
                '🧪 Testar conexão',
                '💬 Teste rápido de mensagem',
                '🗣️ Configurações de Voz',
                '🎤 Testar Text-to-Speech',
                '📊 Ver logs do console',
                '❌ Cancelar'
            ];
            
            const choice = prompt(`Configurações do Jarvis:\
\
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\
')}\
\
Escolha uma opção (1-${options.length}):`);
            
            switch(choice) {
                case '1':
                case '2':
                case '3':
                case '6':
                    // Chamar handler original para essas opções
                    if (originalSettingsHandler) {
                        originalSettingsHandler(choice);
                    }
                    break;
                case '4':
                    this.showTTSSettings();
                    break;
                case '5':
                    this.testTTS();
                    break;
                default:
                    return;
            }
        };
    }

    showTTSSettings() {
        if (!this.isSupported) {
            alert('❌ Text-to-Speech não é suportado neste navegador.');
            return;
        }

        const currentVoice = this.voices[this.settings.voiceIndex];
        const voiceName = currentVoice ? `${currentVoice.name} (${currentVoice.lang})` : 'Auto';
        
        const settings = [
            `🎤 Voz: ${voiceName}`,
            `⚡ Velocidade: ${this.settings.rate}`,
            `🎵 Tom: ${this.settings.pitch}`,
            `🔊 Volume: ${this.settings.volume}`,
            `🤖 Auto-falar: ${this.settings.autoSpeak ? 'Sim' : 'Não'}`,
            '🔄 Resetar configurações',
            '❌ Voltar'
        ];
        
        const choice = prompt(`Configurações de Voz:\
\
${settings.map((opt, i) => `${i + 1}. ${opt}`).join('\
')}\
\
Escolha uma opção (1-${settings.length}):`);
        
        switch(choice) {
            case '1':
                this.selectVoice();
                break;
            case '2':
                this.adjustRate();
                break;
            case '3':
                this.adjustPitch();
                break;
            case '4':
                this.adjustVolume();
                break;
            case '5':
                this.toggleAutoSpeak();
                break;
            case '6':
                this.resetSettings();
                break;
            default:
                return;
        }
    }

    selectVoice() {
        if (this.voices.length === 0) {
            alert('❌ Nenhuma voz disponível.');
            return;
        }

        const voiceOptions = this.voices.map((voice, index) => 
            `${index + 1}. ${voice.name} (${voice.lang})${voice.default ? ' [Padrão]' : ''}`
        );
        
        const choice = prompt(`Selecione uma voz:\
\
${voiceOptions.join('\
')}\
\
Digite o número da voz (1-${this.voices.length}):`);
        
        const voiceIndex = parseInt(choice) - 1;
        if (voiceIndex >= 0 && voiceIndex < this.voices.length) {
            this.settings.voiceIndex = voiceIndex;
            this.saveSettings();
            alert(`✅ Voz selecionada: ${this.voices[voiceIndex].name}`);
            this.testTTS();
        }
    }

    adjustRate() {
        const newRate = prompt(`Velocidade da fala (0.1 - 2.0):\
\
Atual: ${this.settings.rate}\
\
Digite a nova velocidade:`, this.settings.rate);
        const rate = parseFloat(newRate);
        
        if (!isNaN(rate) && rate >= 0.1 && rate <= 2.0) {
            this.settings.rate = rate;
            this.saveSettings();
            alert(`✅ Velocidade ajustada para: ${rate}`);
            this.testTTS();
        } else if (newRate !== null) {
            alert('❌ Valor inválido. Use um número entre 0.1 e 2.0');
        }
    }

    adjustPitch() {
        const newPitch = prompt(`Tom da voz (0.0 - 2.0):\
\
Atual: ${this.settings.pitch}\
\
Digite o novo tom:`, this.settings.pitch);
        const pitch = parseFloat(newPitch);
        
        if (!isNaN(pitch) && pitch >= 0.0 && pitch <= 2.0) {
            this.settings.pitch = pitch;
            this.saveSettings();
            alert(`✅ Tom ajustado para: ${pitch}`);
            this.testTTS();
        } else if (newPitch !== null) {
            alert('❌ Valor inválido. Use um número entre 0.0 e 2.0');
        }
    }

    adjustVolume() {
        const newVolume = prompt(`Volume da voz (0.0 - 1.0):\
\
Atual: ${this.settings.volume}\
\
Digite o novo volume:`, this.settings.volume);
        const volume = parseFloat(newVolume);
        
        if (!isNaN(volume) && volume >= 0.0 && volume <= 1.0) {
            this.settings.volume = volume;
            this.saveSettings();
            alert(`✅ Volume ajustado para: ${volume}`);
            this.testTTS();
        } else if (newVolume !== null) {
            alert('❌ Valor inválido. Use um número entre 0.0 e 1.0');
        }
    }

    toggleAutoSpeak() {
        this.settings.autoSpeak = !this.settings.autoSpeak;
        this.saveSettings();
        alert(`✅ Auto-falar ${this.settings.autoSpeak ? 'ativado' : 'desativado'}`);
    }

    resetSettings() {
        if (confirm('🔄 Resetar todas as configurações de voz para o padrão?')) {
            this.settings = {
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8,
                voiceIndex: -1,
                autoSpeak: true
            };
            this.autoSelectVoice();
            this.saveSettings();
            alert('✅ Configurações resetadas!');
        }
    }

    testTTS() {
        const testPhrases = [
            'Olá! Eu sou o Jarvis, seu assistente virtual.',
            'Sistema de voz funcionando perfeitamente.',
            'Como posso ajudá-lo hoje?',
            'Todos os sistemas operacionais.'
        ];
        
        const randomPhrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
        this.speak(randomPhrase);
    }

    // Método público para ser chamado pelo main.js
    speakResponse(text) {
        if (this.settings.autoSpeak && this.isEnabled) {
            this.speak(text);
        }
    }
}

// Inicializar TTS quando o documento estiver pronto
let jarvisTTS = null;

$(document).ready(function() {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
        jarvisTTS = new JarvisTTS();
        
        // Tornar disponível globalmente
        window.jarvisTTS = jarvisTTS;
        
        console.log('🎤 Jarvis TTS integrado com sucesso!');
    }, 1000);
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JarvisTTS;
}"