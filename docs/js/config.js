/**
 * config.js
 * 
 * Armazena as configurações centrais da aplicação JARVIS.
 * Isso facilita a manutenção e evita que valores fixos fiquem espalhados pelo código.
 */

// Tenta obter a URL da API do armazenamento local, caso contrário, usa a padrão.
const getApiUrl = () => {
    return localStorage.getItem('FRONT_API_URL') || 'https://jarvis-tdgt.onrender.com';
};

export const config = {
    debugMode: true, // Ativa logs detalhados no console
    language: 'pt-BR', // Idioma padrão para reconhecimento e síntese de voz
    apiUrl: getApiUrl(), // URL da API para processamento de comandos
    apiTimeout: 45000, // Tempo máximo de espera para uma resposta da API (em ms)

    // Configurações para a síntese de voz (TTS)
    voiceSettings: {
        rate: 1,       // Velocidade da fala (0.1 a 10)
        pitch: 1,      // Tom da fala (0 a 2)
        volume: 0.9,   // Volume da fala (0 a 1)
        voice: 'pt-BR' // Idioma da voz
    },

    // Configurações para o reconhecimento de voz (STT)
    speechRecognition: {
        lang: 'pt-BR',
        interimResults: true, // Mostra resultados parciais enquanto o usuário fala
        maxAlternatives: 1
    }
};

// Função para atualizar a URL da API dinamicamente
export function updateApiUrl(newUrl) {
    if (newUrl) {
        localStorage.setItem('FRONT_API_URL', newUrl);
        config.apiUrl = newUrl;
        console.log(`URL da API atualizada para: ${newUrl}`);
        return true;
    }
    return false;
}
