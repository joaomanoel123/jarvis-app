/**
 * tts.js (Text-to-Speech)
 * 
 * Módulo para gerenciar a síntese de voz do navegador (fala).
 * Encapsula a API `SpeechSynthesis` para fornecer uma interface simples e controlável.
 */

let voiceSettings = {};
const synth = window.speechSynthesis;

/**
 * Inicializa o módulo TTS com as configurações fornecidas.
 * @param {object} settings - Objeto de configuração para a voz.
 */
export function initTTS(settings) {
    voiceSettings = settings;
    // Um pequeno truque para garantir que as vozes sejam carregadas em alguns navegadores
    synth.getVoices();
    console.log('✅ TTS Module Initialized');
}

/**
 * Converte um texto em fala.
 * Cancela qualquer fala anterior para evitar sobreposição.
 * @param {string} text - O texto a ser falado.
 */
export function speak(text) {
    if (!text) {
        console.warn('TTS: Texto para falar está vazio.');
        return;
    }

    if (synth.speaking) {
        console.log('TTS: Cancelando fala anterior.');
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
        console.log(`🗣️ Falando: "${text}"`);
    };

    utterance.onerror = (event) => {
        console.error('❌ Erro na síntese de voz:', event.error);
    };

    // Aplica as configurações de voz
    utterance.lang = voiceSettings.lang || 'pt-BR';
    utterance.rate = voiceSettings.rate || 1;
    utterance.pitch = voiceSettings.pitch || 1;
    utterance.volume = voiceSettings.volume || 1;

    // A seleção de voz específica pode ser mais complexa, mas aqui está uma abordagem simples
    const voices = synth.getVoices();
    const desiredVoice = voices.find(voice => voice.lang === voiceSettings.voice);
    if (desiredVoice) {
        utterance.voice = desiredVoice;
    }

    // Adiciona um pequeno delay para garantir que o cancelamento foi processado
    setTimeout(() => {
        synth.speak(utterance);
    }, 100);
}

/**
 * Para a fala que está sendo reproduzida no momento.
 */
export function stop() {
    if (synth.speaking) {
        synth.cancel();
        console.log('🔇 Fala interrompida.');
    }
}
