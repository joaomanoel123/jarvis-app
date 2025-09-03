/**
 * speech.js (Speech-to-Text)
 * 
 * Módulo para gerenciar o reconhecimento de voz do navegador.
 * Encapsula a API `webkitSpeechRecognition` em uma classe baseada em eventos,
 * tornando-a mais fácil de usar e mais robusta.
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export class SpeechRecognitionService {
    constructor(settings) {
        if (!SpeechRecognition) {
            console.error('Reconhecimento de voz não é suportado neste navegador.');
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = settings.lang || 'pt-BR';
        this.recognition.interimResults = settings.interimResults || false;
        this.recognition.maxAlternatives = settings.maxAlternatives || 1;

        this.isListening = false;
        this.events = {}; // Armazena os callbacks dos eventos

        this.setupListeners();
        console.log('✅ Speech Recognition Module Initialized');
    }

    /**
     * Registra um callback para um evento específico.
     * @param {'start' | 'result' | 'interim_result' | 'end' | 'error'} event - O nome do evento.
     * @param {Function} callback - A função a ser chamada.
     */
    on(event, callback) {
        this.events[event] = callback;
    }

    /**
     * Inicia o reconhecimento de voz.
     */
    start() {
        if (!this.isSupported || this.isListening) {
            return;
        }
        this.isListening = true;
        this.recognition.start();
    }

    /**
     * Para o reconhecimento de voz.
     */
    stop() {
        if (!this.isSupported || !this.isListening) {
            return;
        }
        this.isListening = false;
        this.recognition.stop();
    }

    /**
     * Configura os listeners internos da API de reconhecimento de voz.
     */
    setupListeners() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.trigger('start');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.trigger('end');
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            this.trigger('error', event.error, event.message);
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.trigger('result', finalTranscript.trim());
            }
            if (interimTranscript) {
                this.trigger('interim_result', interimTranscript.trim());
            }
        };
    }

    /**
     * Dispara um evento registrado.
     * @param {string} event - O nome do evento.
     * @param  {...any} args - Argumentos para passar ao callback.
     */
    trigger(event, ...args) {
        if (this.events[event]) {
            this.events[event](...args);
        }
    }
}
