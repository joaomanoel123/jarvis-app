# 🤖 J.A.R.V.I.S - Assistente Virtual Inteligente

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://joaomanoel123.github.io/jarvis/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://joaomanoel123.github.io/jarvis/manifest.json)
[![TTS Support](https://img.shields.io/badge/TTS-pt--BR-orange)](https://joaomanoel123.github.io/jarvis/)

Assistente virtual inteligente com IA, reconhecimento de voz e interface futurista. Criado por João Manoel com tecnologias modernas e compatível com GitHub Pages.

## 🚀 Acesso Rápido

- **🌐 Site Principal**: [https://joaomanoel123.github.io/jarvis/](https://joaomanoel123.github.io/jarvis/)
- **🔍 Verificação**: [https://joaomanoel123.github.io/jarvis/verify_github_pages.html](https://joaomanoel123.github.io/jarvis/verify_github_pages.html)
- **🎨 Gerador de Ícones**: [https://joaomanoel123.github.io/jarvis/create_icon.html](https://joaomanoel123.github.io/jarvis/create_icon.html)

## ✨ Funcionalidades

### 🎤 Reconhecimento de Voz
- Suporte para português brasileiro (pt-BR)
- Ativação por atalhos (Ctrl+J ou Espaço)
- Resultados em tempo real
- Tratamento robusto de erros

### 🔊 Text-to-Speech (TTS)
- Vozes em português brasileiro
- Fallback automático para outras vozes
- Configurações personalizáveis
- Carregamento assíncrono otimizado

### 🤖 Inteligência Artificial
- Integração com Groq API
- Respostas em português
- Comandos locais integrados
- Fallbacks para conectividade

### 📱 Progressive Web App (PWA)
- Instalação como aplicativo
- Ícones otimizados (192px, 512px)
- Funciona offline (básico)
- Interface responsiva

## 🎯 Comandos Suportados

### Comandos de Voz/Texto
- **WhatsApp**: \"abrir whatsapp\", \"whats\", \"zap\"
- **YouTube**: \"abrir youtube\", \"youtube\"
- **Google**: \"abrir google\", \"pesquisar\"
- **Configurações**: \"configurações\", \"settings\"
- **Teste**: \"teste\", \"diagnóstico\"

### Atalhos de Teclado
- **Ctrl+J** (Windows/Linux) ou **Cmd+J** (Mac): Ativar microfone
- **Espaço**: Ativar microfone (quando não digitando)
- **Enter**: Enviar mensagem digitada

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Animações e gradientes
- **JavaScript ES6+**: Lógica principal
- **jQuery 3.6.4**: Manipulação DOM
- **Bootstrap 5**: Interface responsiva

### Bibliotecas
- **SiriWave**: Visualização de áudio
- **Textillate.js**: Animações de texto
- **Animate.css**: Animações CSS
- **Lottie**: Animações vetoriais

### APIs
- **Web Speech API**: Reconhecimento de voz
- **Speech Synthesis API**: Text-to-Speech
- **Groq API**: Inteligência artificial
- **Google Cloud TTS**: TTS premium (opcional)

## 🔧 Configuração

### Configuração Básica
1. Acesse as configurações clicando no ícone ⚙️
2. Configure a URL da API se necessário
3. Teste a conectividade
4. Ajuste configurações de voz

### Configuração Avançada
```javascript
// Acessar configurações via console
jarvisConfig.showQuickSettings();

// Diagnóstico completo
jarvisConfig.diagnose();

// Configurar API personalizada
jarvisConfig.setApiUrl('https://sua-api.com');
```

## 📊 Status do Sistema

### Verificação Automática
Acesse [verify_github_pages.html](https://joaomanoel123.github.io/jarvis/verify_github_pages.html) para:
- ✅ Testar conectividade da API
- ✅ Verificar TTS e Speech Recognition
- ✅ Validar recursos PWA
- ✅ Gerar relatórios de diagnóstico

### Monitoramento Manual
```javascript
// No console do navegador (F12)
console.log('API URL:', jarvisConfig.getApiUrl());
console.log('TTS Status:', jarvisTTS?.isEnabled);
console.log('Voices:', speechSynthesis.getVoices().length);
```

## 🔐 Segurança

### HTTPS Obrigatório
- GitHub Pages força HTTPS automaticamente
- Todas as APIs devem usar HTTPS
- Recursos externos verificados

### Privacidade
- Reconhecimento de voz processado localmente
- Dados não armazenados permanentemente
- APIs externas usadas apenas quando necessário

## 🚀 Deploy

### GitHub Actions
O deploy é automático via GitHub Actions:
```yaml
# .github/workflows/pages.yml
name: Deploy J.A.R.V.I.S to GitHub Pages
on:
  push:
    branches: [ main ]
```

### Deploy Manual
```bash
git add .
git commit -m \"Update Jarvis\"
git push origin main
```

## 🐛 Troubleshooting

### Problemas Comuns

#### TTS não funciona
- Verifique se está usando HTTPS
- Teste em Chrome/Edge (melhor suporte)
- Aguarde carregamento das vozes

#### API não responde
- Verifique conectividade de rede
- API pode estar em cold start (Render.com)
- Teste URL alternativa

#### Reconhecimento falha
- Permita acesso ao microfone
- Use ambiente silencioso
- Verifique se está usando HTTPS

### Logs e Diagnóstico
```javascript
// Ativar logs detalhados
localStorage.setItem('JARVIS_DEBUG', 'true');

// Executar diagnóstico
jarvisConfig.diagnose().then(console.log);

// Verificar vozes TTS
console.log(speechSynthesis.getVoices());
```

## 📱 Instalação como PWA

### Desktop
1. Acesse o site no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

### Mobile
1. Acesse o site no navegador
2. Toque no menu do navegador
3. Selecione \"Adicionar à tela inicial\"

## 🔄 Atualizações

### Automáticas
- Deploy automático no push para main
- Cache inteligente do navegador
- Service Worker para atualizações

### Forçar Atualização
- Ctrl+F5 (hard refresh)
- Limpar cache do navegador
- Reinstalar PWA

## 📞 Suporte

### Recursos de Ajuda
- **Diagnóstico**: Use a página de verificação
- **Logs**: Console do navegador (F12)
- **Configurações**: Menu de configurações integrado

### Contato
- **Desenvolvedor**: João Manoel
- **GitHub**: [joaomanoel123](https://github.com/joaomanoel123)
- **Projeto**: [jarvis](https://github.com/joaomanoel123/jarvis)

---

**🤖 Jarvis está sempre evoluindo! Contribuições são bem-vindas.**

[![Made with ❤️ by João Manoel](https://img.shields.io/badge/Made%20with%20❤️%20by-João%20Manoel-red)](https://github.com/joaomanoel123)