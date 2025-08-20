/**
 * 🔐 Google OAuth Integration for J.A.R.V.I.S
 * Integração completa com Google OAuth para autenticação
 */

class GoogleAuthManager {
    constructor() {
        this.clientId = '679324504794-78c86mu8ddnj5m0o1l88utansi0rei3s.apps.googleusercontent.com';
        this.isSignedIn = false;
        this.currentUser = null;
        this.authInstance = null;
        
        // Configurações
        this.config = {
            client_id: this.clientId,
            scope: 'openid profile email',
            ux_mode: 'popup',
            redirect_uri: this.getRedirectUri()
        };
        
        this.init();
    }
    
    getRedirectUri() {
        const currentUrl = window.location.origin + window.location.pathname;
        
        if (currentUrl.includes('github.io')) {
            return 'https://joaomanoel123.github.io/jarvis/auth/callback';
        } else if (currentUrl.includes('localhost')) {
            return 'http://localhost:8000/auth/callback';
        } else {
            return currentUrl + 'auth/callback';
        }
    }
    
    async init() {
        console.log('🔐 Inicializando Google OAuth...');
        
        try {
            // Carregar Google API
            await this.loadGoogleAPI();
            
            // Inicializar Auth2
            await this.initAuth2();
            
            // Verificar se já está logado
            this.checkSignInStatus();
            
            // Adicionar botões à interface
            this.addAuthButtons();
            
            console.log('✅ Google OAuth inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Google OAuth:', error);
        }
    }
    
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            // Verificar se já foi carregado
            if (window.gapi) {
                resolve();
                return;
            }
            
            // Carregar script do Google API
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('auth2', resolve);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    initAuth2() {
        return new Promise((resolve, reject) => {
            gapi.auth2.init(this.config).then((authInstance) => {
                this.authInstance = authInstance;
                
                // Listener para mudanças de estado
                this.authInstance.isSignedIn.listen((isSignedIn) => {
                    this.handleSignInChange(isSignedIn);
                });
                
                resolve();
            }).catch(reject);
        });
    }
    
    checkSignInStatus() {
        if (this.authInstance) {
            const isSignedIn = this.authInstance.isSignedIn.get();
            this.handleSignInChange(isSignedIn);
        }
    }
    
    handleSignInChange(isSignedIn) {
        this.isSignedIn = isSignedIn;
        
        if (isSignedIn) {
            this.currentUser = this.authInstance.currentUser.get();
            this.onSignIn(this.currentUser);
        } else {
            this.currentUser = null;
            this.onSignOut();
        }
        
        this.updateAuthButtons();
    }
    
    async signIn() {
        console.log('🔑 Iniciando login...');
        
        try {
            const user = await this.authInstance.signIn();
            console.log('✅ Login realizado com sucesso');
            return user;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    }
    
    async signOut() {
        console.log('🚪 Fazendo logout...');
        
        try {
            await this.authInstance.signOut();
            console.log('✅ Logout realizado com sucesso');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            throw error;
        }
    }
    
    onSignIn(user) {
        const profile = user.getBasicProfile();
        const authResponse = user.getAuthResponse();
        
        console.log('👤 Usuário logado:', {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            image: profile.getImageUrl()
        });
        
        // Atualizar interface
        this.updateUserInterface(profile);
        
        // Salvar token para uso posterior
        localStorage.setItem('google_access_token', authResponse.access_token);
        localStorage.setItem('google_id_token', authResponse.id_token);
        
        // Disparar evento personalizado
        this.dispatchAuthEvent('google-signin', {
            user: {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                image: profile.getImageUrl()
            },
            tokens: {
                access_token: authResponse.access_token,
                id_token: authResponse.id_token
            }
        });
    }
    
    onSignOut() {
        console.log('👋 Usuário deslogado');
        
        // Limpar tokens
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_id_token');
        
        // Atualizar interface
        this.updateUserInterface(null);
        
        // Disparar evento personalizado
        this.dispatchAuthEvent('google-signout', null);
    }
    
    updateUserInterface(profile) {
        // Atualizar informações do usuário na interface
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (profile) {
            // Usuário logado
            if (userInfo) userInfo.style.display = 'block';
            if (userAvatar) userAvatar.src = profile.getImageUrl();
            if (userName) userName.textContent = profile.getName();
            
            // Personalizar saudação do J.A.R.V.I.S
            const wishMessage = document.getElementById('WishMessage');
            if (wishMessage) {
                const firstName = profile.getName().split(' ')[0];
                wishMessage.textContent = `Olá, ${firstName}! Como posso ajudá-lo?`;
            }
        } else {
            // Usuário deslogado
            if (userInfo) userInfo.style.display = 'none';
            if (userAvatar) userAvatar.src = '';
            if (userName) userName.textContent = '';
            
            // Resetar saudação
            const wishMessage = document.getElementById('WishMessage');
            if (wishMessage) {
                wishMessage.textContent = 'Ask me anything';
            }
        }
    }
    
    addAuthButtons() {
        // Adicionar botão de login/logout ao menu de configurações
        const settingsArea = document.getElementById('TextInput');
        if (settingsArea) {
            const authBtn = document.createElement('button');
            authBtn.id = 'GoogleAuthBtn';
            authBtn.className = 'glow-on-hover';
            authBtn.innerHTML = '<i class="bi bi-person-circle"></i>';
            authBtn.title = 'Google Login';
            authBtn.onclick = () => this.toggleAuth();
            
            settingsArea.appendChild(authBtn);
            this.updateAuthButtons();
        }
    }
    
    updateAuthButtons() {
        const authBtn = document.getElementById('GoogleAuthBtn');
        if (authBtn) {
            const icon = authBtn.querySelector('i');
            
            if (this.isSignedIn) {
                icon.className = 'bi bi-person-check-fill';
                authBtn.style.color = '#00ff88';
                authBtn.title = 'Logado - Clique para logout';
            } else {
                icon.className = 'bi bi-person-circle';
                authBtn.style.color = '';
                authBtn.title = 'Fazer login com Google';
            }
        }
    }
    
    async toggleAuth() {
        if (this.isSignedIn) {
            await this.signOut();
        } else {
            await this.signIn();
        }
    }
    
    dispatchAuthEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data
        });
        window.dispatchEvent(event);
    }
    
    // Métodos públicos para uso externo
    getAccessToken() {
        return localStorage.getItem('google_access_token');
    }
    
    getIdToken() {
        return localStorage.getItem('google_id_token');
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isUserSignedIn() {
        return this.isSignedIn;
    }
    
    getUserProfile() {
        if (this.currentUser) {
            const profile = this.currentUser.getBasicProfile();
            return {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                image: profile.getImageUrl()
            };
        }
        return null;
    }
}

// Inicializar quando o documento estiver pronto
let googleAuthManager = null;

$(document).ready(function() {
    // Aguardar um pouco para garantir que tudo foi carregado
    setTimeout(() => {
        googleAuthManager = new GoogleAuthManager();
        
        // Tornar disponível globalmente
        window.googleAuthManager = googleAuthManager;
        
        console.log('🔐 Google Auth Manager integrado com sucesso!');
    }, 2000);
});

// Event listeners para integração com o J.A.R.V.I.S
window.addEventListener('google-signin', function(event) {
    const userData = event.detail;
    console.log('🎉 Usuário logado via Google:', userData.user.name);
    
    // Integrar com sistema de voz se disponível
    if (window.jarvisTTS && window.jarvisTTS.speak) {
        window.jarvisTTS.speak(`Olá ${userData.user.name.split(' ')[0]}! Bem-vindo de volta ao J.A.R.V.I.S.`);
    }
});

window.addEventListener('google-signout', function(event) {
    console.log('👋 Usuário deslogado');
    
    // Integrar com sistema de voz se disponível
    if (window.jarvisTTS && window.jarvisTTS.speak) {
        window.jarvisTTS.speak('Logout realizado com sucesso. Até logo!');
    }
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleAuthManager;
}