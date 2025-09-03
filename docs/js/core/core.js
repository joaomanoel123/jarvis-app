/**
 * core.js
 * 
 * O cérebro da aplicação JARVIS. Este módulo orquestra todos os outros módulos (UI, API, TTS, Speech).
 * Ele contém a lógica de negócios principal, gerencia o estado da aplicação e lida com as interações do usuário.
 */

import { config, updateApiUrl } from './config.js';
import * as ui from './ui.js';
import * as api from './api.js';
import * as tts from './tts.js';
import { SpeechRecognitionService } from './speech.js';

let speechService;
let isListening = false;

/**
 * Inicializa o núcleo do JARVIS.
 */
export function init() {
    console.log('🚀 Initializing JARVIS Core...');
    
    // Inicializa os módulos
    ui.initUI();
    tts.initTTS(config.voiceSettings);
    speechService = new SpeechRecognitionService(config.speechRecognition);

    // Configura os event listeners da UI, passando as funções de tratamento do core
    ui.setupEventListeners({
        onMicClick: handleMicClick,
        onSendClick: handleSendClick,
        onSettingsClick: handleSettingsClick
    });

    // Configura os eventos do serviço de reconhecimento de voz
    setupSpeechServiceEvents();

    // Inicia a animação de introdução
    ui.startInitialAnimation();
    
    console.log('🎆 JARVIS Core Initialized Successfully!');
}

/**
 * Lida com o clique no botão do microfone.
 */
function handleMicClick() {
    if (!speechService.isSupported) {
        ui.updateWishMessage('❌ Reconhecimento de voz não suportado neste navegador.');
        tts.speak('Reconhecimento de voz não é suportado neste navegador.');
        return;
    }

    if (isListening) {
        speechService.stop();
    } else {
        speechService.start();
    }
}

/**
 * Lida com o clique no botão de enviar (ou Enter no chatbox).
 */
function handleSendClick() {
    const message = $('#chatbox').val();
    if (message.trim()) {
        processCommand(message);
    }
}

/**
 * Lida com o clique no botão de configurações.
 */
function handleSettingsClick() {
    const action = prompt("O que você deseja fazer?\n\n- Digite 'api' para configurar a URL.\n- Digite 'test' para testar a conexão.");
    if (action === 'api') {
        const newUrl = prompt("Digite a nova URL da API:", config.apiUrl);
        if (updateApiUrl(newUrl)) {
            ui.updateWishMessage('URL da API atualizada!');
            tts.speak('URL da API atualizada!');
        }
    } else if (action === 'test') {
        testApiConnection();
    }
}

/**
 * Processa o comando do usuário, seja por texto ou voz.
 * @param {string} command - O comando a ser processado.
 */
async function processCommand(command) {
    ui.addChatMessage(command, 'sender');
    ui.showProcessingUI();
    tts.stop(); // Para qualquer fala que esteja acontecendo

    // Tratamento de comandos locais (front-end)
    if (handleLocalCommand(command)) {
        return;
    }

    // Envio para a API
    try {
        const data = await api.sendCommand(command);
        let reply = 'Desculpe, não entendi a resposta da API.';

        if (data.error) {
            reply = `Erro da API: ${data.reply || data.error}`;
        } else if (data.reply) {
            reply = data.reply;
        }

        ui.addChatMessage(reply, 'receiver');
        ui.updateWishMessage(reply);
        tts.speak(reply);
        ui.resetToMainScreen(reply);

    } catch (error) {
        console.error('Falha ao processar comando:', error);
        const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
        ui.updateWishMessage(errorMessage);
        tts.speak(errorMessage);
        ui.resetToMainScreen(errorMessage);
    }
}

/**
 * Testa a conexão com a API e atualiza a UI.
 */
async function testApiConnection() {
    ui.updateWishMessage('Testando conexão com a API...');
    tts.speak('Testando conexão com a API.');
    try {
        const data = await api.testConnection();
        const message = `✅ Conexão bem-sucedida! Status: ${data.status}`;
        ui.updateWishMessage(message);
        tts.speak('Conexão bem sucedida.');
    } catch (error) {
        const message = `🚫 Falha na conexão: ${error.message}`;
        ui.updateWishMessage(message);
        tts.speak('Falha na conexão.');
    }
}

/**
 * Lida com comandos que podem ser executados diretamente no front-end.
 * @param {string} command - O comando do usuário.
 * @returns {boolean} - Retorna true se o comando foi local e tratado, false caso contrário.
 */
function handleLocalCommand(command) {
    const lowerCaseCommand = command.toLowerCase();
    let handled = false;
    let reply = '';

    if (lowerCaseCommand.includes("abrir whatsapp")) {
        reply = "Abrindo WhatsApp Web.";
        window.open("https://web.whatsapp.com/", "_blank");
        handled = true;
    }
    else if (lowerCaseCommand.includes("abrir youtube")) {
        reply = "OK, abrindo o YouTube.";
        window.open("https://www.youtube.com/", "_blank");
        handled = true;
    }

    if (handled) {
        ui.updateWishMessage(reply);
        tts.speak(reply);
        ui.resetToMainScreen(reply);
    }

    return handled;
}

/**
 * Configura os callbacks para os eventos do serviço de reconhecimento de voz.
 */
function setupSpeechServiceEvents() {
    speechService.on('start', () => {
        isListening = true;
        ui.showListeningUI();
    });

    speechService.on('interim_result', (transcript) => {
        ui.updateWishMessage(`🎤 Ouvindo: "${transcript}"`);
    });

    speechService.on('result', (transcript) => {
        ui.updateWishMessage(`💬 Você disse: "${transcript}"`);
        setTimeout(() => processCommand(transcript), 500);
    });

    speechService.on('end', () => {
        isListening = false;
        ui.resetMicInterface();
    });

    speechService.on('error', (error, message) => {
        const errorMessages = {
            'not-allowed': '🚫 Permissão de microfone negada.',
            'no-speech': '🔇 Nenhuma fala detectada. Tente novamente.',
            'audio-capture': '🎤 Erro na captação de áudio.',
            'network': '🌐 Erro de rede durante o reconhecimento.',
        };
        const displayMessage = errorMessages[error] || `Erro: ${message || error}`;
        ui.updateWishMessage(displayMessage);
    });
}
