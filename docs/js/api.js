/**
 * api.js
 * 
 * Módulo para gerenciar todas as comunicações com a API backend.
 * Centraliza a lógica de requisições de rede (fetch), tratamento de erros e timeouts.
 */

import { config } from './config.js';

/**
 * Envia um comando de texto para a API do JARVIS e retorna a resposta.
 * @param {string} message - A mensagem a ser enviada.
 * @returns {Promise<object>} A resposta da API em formato JSON.
 * @throws {Error} Lança um erro em caso de falha na rede, timeout ou resposta inválida.
 */
export async function sendCommand(message) {
    console.log(`🔗 Enviando comando para API: ${config.apiUrl}`);

    // AbortController para implementar o timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
        const response = await fetch(`${config.apiUrl}/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message }),
            signal: controller.signal // Vincula o AbortController à requisição
        });

        // Limpa o timeout se a resposta chegar a tempo
        clearTimeout(timeoutId);

        if (!response.ok) {
            // Tenta extrair uma mensagem de erro do corpo da resposta, se houver
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.reply || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data || (!data.reply && !data.error)) {
            throw new Error('Resposta inválida da API. O formato não é o esperado.');
        }

        console.log('✅ Resposta da API recebida:', data);
        return data;

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            console.error('❌ Erro de API: Timeout');
            throw new Error('Timeout: A API demorou muito para responder.');
        }
        
        console.error('❌ Erro de API:', error.message);
        // Repassa o erro para ser tratado pelo módulo que chamou
        throw error;
    }
}

/**
 * Testa a conexão com o endpoint de status da API.
 * @returns {Promise<object>} A resposta do endpoint de status.
 * @throws {Error} Lança um erro se a conexão falhar.
 */
export async function testConnection() {
    console.log(`📡 Testando conexão com a API: ${config.apiUrl}`);
    try {
        const response = await fetch(`${config.apiUrl}/status`);
        if (!response.ok) {
            throw new Error(`Falha na conexão. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Conexão com API bem-sucedida:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error.message);
        throw error;
    }
}
