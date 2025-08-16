/**
 * Service Worker para J.A.R.V.I.S
 * Fornece funcionalidades básicas de PWA
 */

const CACHE_NAME = 'jarvis-v1.0.0';
const BASE_PATH = '/jarvis';

// Arquivos essenciais para cache
const ESSENTIAL_FILES = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/style.css`,
    `${BASE_PATH}/manifest.json`,
    `${BASE_PATH}/jarvis-config.js`,
    `${BASE_PATH}/jarvis-tts.js`,
    `${BASE_PATH}/jarvis-speech-recognition.js`,
    `${BASE_PATH}/main-github-pages-fixed.js`,
    `${BASE_PATH}/controller.js`,
    `${BASE_PATH}/assets/img/logo.ico`
];

// Recursos externos importantes
const EXTERNAL_RESOURCES = [
    'https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
    'https://unpkg.com/siriwave/dist/siriwave.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: Cache aberto');
                
                // Cache arquivos essenciais
                return cache.addAll(ESSENTIAL_FILES)
                    .then(() => {
                        console.log('✅ Service Worker: Arquivos essenciais em cache');
                        
                        // Tentar cache de recursos externos (não crítico)
                        return Promise.allSettled(
                            EXTERNAL_RESOURCES.map(url => 
                                cache.add(url).catch(err => 
                                    console.warn(`⚠️ Falha ao cachear ${url}:`, err)
                                )
                            )
                        );
                    });
            })
            .then(() => {
                console.log('✅ Service Worker: Instalação concluída');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Erro na instalação:', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Ativação concluída');
                return self.clients.claim();
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar requisições para APIs externas (exceto recursos estáticos)
    if (url.origin !== location.origin && !isStaticResource(url.href)) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(response => {
                // Retornar do cache se disponível
                if (response) {
                    console.log('📦 Cache hit:', request.url);
                    return response;
                }
                
                // Buscar da rede
                console.log('🌐 Network fetch:', request.url);
                return fetch(request)
                    .then(response => {
                        // Não cachear respostas inválidas
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Cachear resposta para futuras requisições
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('❌ Network fetch failed:', error);
                        
                        // Retornar página offline para navegação
                        if (request.destination === 'document') {
                            return caches.match(`${BASE_PATH}/index.html`);
                        }
                        
                        throw error;
                    });
            })
    );
});

// Verificar se é um recurso estático
function isStaticResource(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.includes(ext));
}

// Mensagens do cliente
self.addEventListener('message', event => {
    console.log('📨 Service Worker: Mensagem recebida:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch(error => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
});

// Notificações push (futuro)
self.addEventListener('push', event => {
    console.log('🔔 Service Worker: Push recebido:', event);
    
    const options = {
        body: 'Jarvis tem uma nova mensagem para você!',
        icon: `${BASE_PATH}/assets/img/jarvis-icon-192.png`,
        badge: `${BASE_PATH}/assets/img/logo.ico`,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir Jarvis',
                icon: `${BASE_PATH}/assets/img/logo.ico`
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: `${BASE_PATH}/assets/img/logo.ico`
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('J.A.R.V.I.S', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    console.log('🔔 Service Worker: Notificação clicada:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow(`${BASE_PATH}/`)
        );
    }
});

console.log('🤖 Service Worker do Jarvis carregado!');
console.log('📦 Cache:', CACHE_NAME);
console.log('🌐 Base Path:', BASE_PATH);