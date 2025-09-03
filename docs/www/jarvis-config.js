/**
 * Jarvis Configuration Module
 * Configurações centralizadas para o assistente Jarvis
 * Compatível com GitHub Pages e desenvolvimento local
 */

class JarvisConfig {
    constructor() {
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.isHTTPS = window.location.protocol === 'https:';
        
        // URLs da API - CONFIGURE AQUI A URL CORRETA
        this.API_URLS = {
            production: 'https://jarvis-api.onrender.com', // URL baseada no render.yaml
            development: 'http://localhost:8000',
            fallback: 'https://jarvis-api-joao-manoel.onrender.com' // URL alternativa
        };
        
        this.settings = {
            // Configurações de API
            apiTimeout: 45000, // 45 segundos para cold start do Render
            maxRetries: 3,
            retryDelay: 2000,
            
            // Configurações de voz
            speechRecognition: {
                language: 'pt-BR',
                continuous: false,
                interimResults: true,
                timeout: 10000
            },
            
            // Configurações de TTS
            textToSpeech: {
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8,
                autoSpeak: true
            },
            
            // Configurações de interface
            ui: {
                animationDuration: 1000,
                messageDisplayTime: 5000,
                autoHideLoader: true
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('⚙️ Inicializando configurações do Jarvis...');
        console.log('🌐 Ambiente:', this.getEnvironment());
        console.log('🔗 URL da API:', this.getApiUrl());
        console.log('🔒 HTTPS:', this.isHTTPS ? '✅' : '❌');
        
        // Carregar configurações salvas
        this.loadSavedSettings();
        
        // Tornar disponível globalmente
        window.jarvisConfig = this;
    }
    
    getEnvironment() {
        if (this.isGitHubPages) return 'GitHub Pages';
        if (this.isLocalhost) return 'Local Development';
        return 'Production';
    }
    
    getApiUrl() {
        // Verificar se há URL personalizada salva
        const customUrl = localStorage.getItem('JARVIS_API_URL');
        if (customUrl && customUrl.trim()) {
            return customUrl.trim();
        }
        
        // Usar URL baseada no ambiente
        if (this.isLocalhost) {
            return this.API_URLS.development;
        }
        
        return this.API_URLS.production;
    }
    
    setApiUrl(url) {
        if (!url || !url.trim()) {
            localStorage.removeItem('JARVIS_API_URL');
            console.log('🔄 URL da API resetada para padrão');
        } else {
            localStorage.setItem('JARVIS_API_URL', url.trim());
            console.log('💾 URL da API salva:', url.trim());
        }
    }
    
    loadSavedSettings() {
        try {
            const saved = localStorage.getItem('JARVIS_SETTINGS');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsedSettings };
                console.log('⚙️ Configurações carregadas do localStorage');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar configurações:', error);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('JARVIS_SETTINGS', JSON.stringify(this.settings));
            console.log('💾 Configurações salvas');
        } catch (error) {
            console.warn('⚠️ Erro ao salvar configurações:', error);
        }
    }
    
    // Métodos de configuração específicos
    setSpeechLanguage(language) {
        this.settings.speechRecognition.language = language;
        this.saveSettings();
        console.log('🌍 Idioma de reconhecimento alterado para:', language);
    }
    
    setTTSSettings(rate, pitch, volume) {
        this.settings.textToSpeech.rate = rate || this.settings.textToSpeech.rate;
        this.settings.textToSpeech.pitch = pitch || this.settings.textToSpeech.pitch;
        this.settings.textToSpeech.volume = volume || this.settings.textToSpeech.volume;
        this.saveSettings();
        console.log('🔊 Configurações TTS atualizadas');
    }
    
    // Diagnóstico do sistema
    async diagnose() {
        console.log('🔍 Executando diagnóstico completo...');
        
        const diagnosis = {
            environment: this.getEnvironment(),
            apiUrl: this.getApiUrl(),
            isHTTPS: this.isHTTPS,
            speechRecognitionSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            speechSynthesisSupported: 'speechSynthesis' in window,
            userAgent: navigator.userAgent,
            language: navigator.language,
            onLine: navigator.onLine,
            cookiesEnabled: navigator.cookieEnabled,
            timestamp: new Date().toISOString()
        };
        
        // Testar conectividade com a API
        try {
            const response = await fetch(this.getApiUrl() + '/health', {
                method: 'GET',
                timeout: 10000
            });
            diagnosis.apiConnectivity = response.ok;
            diagnosis.apiStatus = response.status;
        } catch (error) {
            diagnosis.apiConnectivity = false;
            diagnosis.apiError = error.message;
        }
        
        console.log('📊 Diagnóstico completo:', diagnosis);
        return diagnosis;
    }
    
    // Configurações rápidas
    showQuickSettings() {
        const options = [
            '🔧 Configurar URL da API',
            '🌍 Alterar idioma de reconhecimento',
            '🔊 Configurações de voz',
            '🧪 Testar conectividade',
            '📊 Executar diagnóstico',
            '🔄 Resetar configurações',
            '❌ Cancelar'
        ];
        
        const choice = prompt(`Configurações Rápidas do Jarvis:\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEscolha uma opção (1-${options.length}):`);
        
        switch(choice) {
            case '1':
                this.configureApiUrl();
                break;
            case '2':
                this.configureLanguage();
                break;
            case '3':
                this.configureTTS();
                break;
            case '4':
                this.testConnectivity();
                break;
            case '5':
                this.showDiagnosis();
                break;
            case '6':
                this.resetSettings();
                break;
        }
    }
    
    configureApiUrl() {
        const current = this.getApiUrl();
        const newUrl = prompt(`URL da API do Jarvis:\n\nAtual: ${current}\n\nDigite a nova URL ou deixe vazio para usar padrão:`, current);
        
        if (newUrl !== null) {
            this.setApiUrl(newUrl);
            alert(`✅ URL configurada: ${this.getApiUrl()}`);
        }
    }
    
    configureLanguage() {
        const languages = [
            'pt-BR - Português (Brasil)',
            'pt-PT - Português (Portugal)',
            'en-US - English (US)',
            'en-GB - English (UK)',
            'es-ES - Español',
            'fr-FR - Français'
        ];
        
        const choice = prompt(`Idioma de reconhecimento:\n\n${languages.map((lang, i) => `${i + 1}. ${lang}`).join('\n')}\n\nEscolha (1-${languages.length}):`);
        
        const langCodes = ['pt-BR', 'pt-PT', 'en-US', 'en-GB', 'es-ES', 'fr-FR'];
        const index = parseInt(choice) - 1;
        
        if (index >= 0 && index < langCodes.length) {
            this.setSpeechLanguage(langCodes[index]);
            alert(`✅ Idioma alterado para: ${languages[index]}`);
        }
    }
    
    configureTTS() {
        const rate = prompt('Velocidade da fala (0.1 - 2.0):', this.settings.textToSpeech.rate);
        const pitch = prompt('Tom da voz (0.0 - 2.0):', this.settings.textToSpeech.pitch);
        const volume = prompt('Volume (0.0 - 1.0):', this.settings.textToSpeech.volume);
        
        this.setTTSSettings(
            parseFloat(rate) || this.settings.textToSpeech.rate,
            parseFloat(pitch) || this.settings.textToSpeech.pitch,
            parseFloat(volume) || this.settings.textToSpeech.volume
        );
        
        alert('✅ Configurações de voz atualizadas!');
    }
    
    async testConnectivity() {
        const apiUrl = this.getApiUrl();
        
        try {
            const response = await fetch(apiUrl + '/health', {
                method: 'GET',
                timeout: 10000
            });
            
            if (response.ok) {
                const data = await response.json();
                alert(`✅ Conectividade OK!\n\nStatus: ${data.status}\nAPI: ${data.api_provider}\nConfigurada: ${data.api_configured}`);
            } else {
                alert(`❌ Erro de conectividade!\n\nStatus: ${response.status}\nURL: ${apiUrl}`);
            }
        } catch (error) {
            alert(`❌ Falha na conectividade!\n\nErro: ${error.message}\nURL: ${apiUrl}`);
        }
    }
    
    async showDiagnosis() {
        const diagnosis = await this.diagnose();
        
        const report = `🔍 Diagnóstico do Sistema Jarvis\n\n` +
            `🌐 Ambiente: ${diagnosis.environment}\n` +
            `🔗 API: ${diagnosis.apiUrl}\n` +
            `📡 Conectividade: ${diagnosis.apiConnectivity ? '✅' : '❌'}\n` +
            `🔒 HTTPS: ${diagnosis.isHTTPS ? '✅' : '❌'}\n` +
            `🎤 Speech Recognition: ${diagnosis.speechRecognitionSupported ? '✅' : '❌'}\n` +
            `🔊 Text-to-Speech: ${diagnosis.speechSynthesisSupported ? '✅' : '❌'}\n` +
            `🌍 Idioma: ${diagnosis.language}\n` +
            `📶 Online: ${diagnosis.onLine ? '✅' : '❌'}`;
        
        alert(report);
    }
    
    resetSettings() {
        if (confirm('🔄 Resetar todas as configurações para o padrão?')) {
            localStorage.removeItem('JARVIS_SETTINGS');
            localStorage.removeItem('JARVIS_API_URL');
            location.reload();
        }
    }
}

// Inicializar configurações quando o documento estiver pronto
$(document).ready(function() {
    window.jarvisConfig = new JarvisConfig();
    console.log('⚙️ Jarvis Config inicializado!');
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JarvisConfig;
}