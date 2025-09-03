/**
 * siriwave.js
 * 
 * Módulo para encapsular a inicialização da biblioteca SiriWave.
 */

/**
 * Cria e retorna uma nova instância de SiriWave.
 * @param {string} containerSelector - O seletor do elemento container para a animação.
 * @returns {SiriWave | null} A instância da SiriWave ou null se o container não for encontrado.
 */
export function initSiriWave(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error('SiriWave container not found!');
        return null;
    }

    // A classe SiriWave é injetada no escopo global pela biblioteca carregada no HTML.
    const siriWave = new SiriWave({
        container: container,
        width: 800,
        height: 200,
        style: "ios9",
        speed: 0.1,
        amplitude: 1.5,
        autostart: false,
        curveDefinition: [
            { color: "255, 255, 255", supportLine: true },
            { color: "68, 214, 255" },
            { color: "0, 170, 255" },
            { color: "0, 102, 255" }
        ]
    });

    console.log('✅ SiriWave Initialized');
    return siriWave;
}
