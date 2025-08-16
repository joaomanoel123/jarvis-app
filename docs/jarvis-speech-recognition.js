/**
 * Jarvis Speech Recognition Module
 * Sistema de reconhecimento de voz otimizado para o Jarvis
 * Compatível com GitHub Pages e dispositivos móveis
 */

class JarvisSpeechRecognition {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        this.settings = {
            language: 'pt-BR',
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            timeout: 10000, // 10 segundos
            noiseThreshold: 0.1,
            autoRestart: true
        };
        
        this.callbacks = {
            onResult: null,
            onError: null,
            onStart: null,
            onEnd: null,
            onInterim: null
        };
        
        this.init();
    }

    checkSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const isSupported = !!SpeechRecognition;
        
        console.log('🎤 Suporte a Speech Recognition:', isSupported ? '✅ Disponível' : '❌ Não disponível');
        
        if (!isSupported) {
            console.warn('⚠️ Web Speech API não suportada neste navegador');
            console.log('📱 Navegadores suportados: Chrome, Edge, Safari (parcial)');
        }
        
        return isSupported;
    }

    init() {
        if (!this.isSupported) {
            console.warn('❌ Speech Recognition não pode ser inicializado');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configurações otimizadas
        this.recognition.lang = this.settings.language;
        this.recognition.continuous = this.settings.continuous;
        this.recognition.interimResults = this.settings.interimResults;
        this.recognition.maxAlternatives = this.settings.maxAlternatives;
        
        // Event listeners
        this.setupEventListeners();
        
        console.log('🎤 Jarvis Speech Recognition inicializado');
        console.log('🌍 Idioma configurado:', this.settings.language);
    }

    setupEventListeners() {
        if (!this.recognition) return;

        // Início do reconhecimento
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('🎤 Reconhecimento de voz iniciado');
            
            if (this.callbacks.onStart) {
                this.callbacks.onStart();
            }
            
            // Timeout de segurança
            this.startTimeout();
        };

        // Resultado do reconhecimento
        this.recognition.onresult = (event) => {
            console.log('📝 Resultado recebido:', event);
            
            let finalTranscript = '';
            let interimTranscript = '';
            
            // Processar todos os resultados
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                
                if (result.isFinal) {
                    finalTranscript += transcript;
                    console.log('✅ Transcrição final:', transcript);
                    console.log('🎯 Confiança:', (result[0].confidence * 100).toFixed(1) + '%');
                } else {
                    interimTranscript += transcript;
                    console.log('⏳ Transcrição parcial:', transcript);
                    
                    if (this.callbacks.onInterim) {
                        this.callbacks.onInterim(transcript);
                    }
                }
            }
            
            // Callback para resultado final
            if (finalTranscript && this.callbacks.onResult) {
                this.callbacks.onResult(finalTranscript.trim(), event.results[event.resultIndex][0].confidence);
            }
        };

        // Fim do reconhecimento
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('🛑 Reconhecimento de voz finalizado');
            
            this.clearTimeout();
            
            if (this.callbacks.onEnd) {
                this.callbacks.onEnd();
            }
        };

        // Erros
        this.recognition.onerror = (event) => {
            console.error('❌ Erro no reconhecimento de voz:', event.error);
            
            let errorMessage = 'Erro desconhecido';
            
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'Nenhuma fala detectada. Tente falar mais alto ou verificar o microfone.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Erro na captação de áudio. Verifique se o microfone está conectado e permitido.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Permissão de microfone negada. Clique no ícone de microfone na barra de endereços para permitir.';
                    break;
                case 'network':
                    errorMessage = 'Erro de rede. Verifique sua conexão com a internet.';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Serviço de reconhecimento não permitido. Tente novamente.';
                    break;
                case 'bad-grammar':
                    errorMessage = 'Erro na gramática de reconhecimento.';
                    break;
                case 'language-not-supported':
                    errorMessage = 'Idioma não suportado. Tentando português brasileiro...';
                    this.settings.language = 'pt-BR';
                    break;
            }
            
            console.log('💡 Sugestão:', errorMessage);
            
            if (this.callbacks.onError) {
                this.callbacks.onError(event.error, errorMessage);
            }
            
            this.isListening = false;
            this.clearTimeout();
        };

        // Sem correspondência
        this.recognition.onnomatch = () => {
            console.warn('⚠️ Nenhuma correspondência encontrada');
            
            if (this.callbacks.onError) {
                this.callbacks.onError('no-match', 'Não foi possível entender o que foi dito. Tente falar mais claramente.');
            }
        };
    }

    startTimeout() {
        this.clearTimeout();
        
        this.timeoutId = setTimeout(() => {
            console.log('⏰ Timeout do reconhecimento de voz');
            this.stop();
            
            if (this.callbacks.onError) {
                this.callbacks.onError('timeout', 'Tempo limite excedido. Tente novamente.');
            }
        }, this.settings.timeout);
    }

    clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    start() {
        if (!this.isSupported) {
            console.error('❌ Speech Recognition não suportado');
            if (this.callbacks.onError) {
                this.callbacks.onError('not-supported', 'Reconhecimento de voz não suportado neste navegador.');
            }
            return false;
        }

        if (this.isListening) {
            console.warn('⚠️ Reconhecimento já está ativo');
            return false;
        }

        try {
            console.log('🚀 Iniciando reconhecimento de voz...');
            console.log('🌍 Idioma:', this.settings.language);
            
            // Atualizar configurações
            this.recognition.lang = this.settings.language;
            this.recognition.continuous = this.settings.continuous;
            this.recognition.interimResults = this.settings.interimResults;
            
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('❌ Erro ao iniciar reconhecimento:', error);
            
            if (this.callbacks.onError) {
                this.callbacks.onError('start-error', 'Erro ao iniciar reconhecimento de voz: ' + error.message);
            }
            
            return false;
        }
    }

    stop() {
        if (!this.recognition || !this.isListening) {
            return;
        }

        try {
            console.log('🛑 Parando reconhecimento de voz...');
            this.recognition.stop();
            this.clearTimeout();
        } catch (error) {
            console.error('❌ Erro ao parar reconhecimento:', error);
        }
    }

    abort() {
        if (!this.recognition) {
            return;
        }

        try {
            console.log('🚫 Abortando reconhecimento de voz...');
            this.recognition.abort();
            this.isListening = false;
            this.clearTimeout();
        } catch (error) {
            console.error('❌ Erro ao abortar reconhecimento:', error);
        }
    }

    // Configurar callbacks
    onResult(callback) {
        this.callbacks.onResult = callback;
    }

    onError(callback) {
        this.callbacks.onError = callback;
    }

    onStart(callback) {
        this.callbacks.onStart = callback;
    }

    onEnd(callback) {
        this.callbacks.onEnd = callback;
    }

    onInterim(callback) {
        this.callbacks.onInterim = callback;
    }

    // Configurações
    setLanguage(language) {
        this.settings.language = language;
        console.log('🌍 Idioma alterado para:', language);
    }

    setTimeout(timeout) {
        this.settings.timeout = timeout;
        console.log('⏰ Timeout alterado para:', timeout + 'ms');
    }

    setContinuous(continuous) {
        this.settings.continuous = continuous;
        console.log('🔄 Modo contínuo:', continuous ? 'Ativado' : 'Desativado');
    }

    setInterimResults(interim) {
        this.settings.interimResults = interim;
        console.log('⏳ Resultados parciais:', interim ? 'Ativados' : 'Desativados');
    }

    // Utilitários
    isAvailable() {
        return this.isSupported;
    }

    isActive() {
        return this.isListening;
    }

    getSettings() {
        return { ...this.settings };
    }

    // Teste de microfone
    async testMicrophone() {
        console.log('🎤 Testando acesso ao microfone...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microfone acessível');
            
            // Parar o stream
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao acessar microfone:', error);
            
            let errorMessage = 'Erro desconhecido';
            
            switch (error.name) {
                case 'NotAllowedError':
                    errorMessage = 'Permissão de microfone negada. Permita o acesso ao microfone.';
                    break;
                case 'NotFoundError':
                    errorMessage = 'Microfone não encontrado. Verifique se está conectado.';
                    break;
                case 'NotReadableError':
                    errorMessage = 'Microfone em uso por outro aplicativo.';
                    break;
                case 'OverconstrainedError':
                    errorMessage = 'Configurações de áudio não suportadas.';
                    break;
                case 'SecurityError':
                    errorMessage = 'Erro de segurança. Use HTTPS.';
                    break;
            }
            
            console.log('💡 Sugestão:', errorMessage);
            return false;
        }
    }

    // Diagnóstico completo
    async diagnose() {
        console.log('🔍 Executando diagnóstico completo...');
        
        const diagnosis = {
            speechRecognitionSupported: this.isSupported,
            microphoneAccess: await this.testMicrophone(),
            currentLanguage: this.settings.language,
            isListening: this.isListening,
            userAgent: navigator.userAgent,
            isSecureContext: window.isSecureContext,
            protocol: window.location.protocol
        };
        
        console.log('📊 Diagnóstico:', diagnosis);
        
        // Recomendações
        const recommendations = [];
        
        if (!diagnosis.speechRecognitionSupported) {
            recommendations.push('Use Chrome, Edge ou Safari para melhor suporte');
        }
        
        if (!diagnosis.microphoneAccess) {
            recommendations.push('Permita acesso ao microfone nas configurações do navegador');
        }
        
        if (!diagnosis.isSecureContext) {
            recommendations.push('Use HTTPS para melhor funcionamento');
        }
        
        if (recommendations.length > 0) {
            console.log('💡 Recomendações:');
            recommendations.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
        }
        
        return diagnosis;
    }
}

// Inicializar quando o documento estiver pronto
let jarvisSpeechRecognition = null;

$(document).ready(function() {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
        jarvisSpeechRecognition = new JarvisSpeechRecognition();
        
        // Tornar disponível globalmente
        window.jarvisSpeechRecognition = jarvisSpeechRecognition;
        
        console.log('🎤 Jarvis Speech Recognition integrado com sucesso!');
    }, 1000);
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JarvisSpeechRecognition;
}