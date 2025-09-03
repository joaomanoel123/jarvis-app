# 🤖 Jarvis API

API backend para o assistente virtual Jarvis integrado com Google Gemini.

## 🏗️ Arquitetura
- **Framework**: FastAPI
- **IA**: Google Gemini Pro
- **Deploy**: Render
- **Frontend**: GitHub Pages

## 🚀 Deploy no Render

### **Configuração Automática**
O projeto está configurado com `render.yaml` para deploy automático.

### **Variáveis de Ambiente Necessárias**
```
GOOGLE_API_KEY = sua_chave_google_gemini
CORS_ORIGINS = https://joaomanoel123.github.io,https://joaomanoel123.github.io/jarvis
ENVIRONMENT = production
```

### **URLs de Produção**
- **API**: https://jarvis-tdgt.onrender.com
- **Docs**: https://jarvis-tdgt.onrender.com/docs
- **Health**: https://jarvis-tdgt.onrender.com/health

## 🔧 Desenvolvimento Local

1. **Instalar dependências**:
```bash
pip install -r requirements.txt
```

2. **Configurar variáveis**:
```bash
export GOOGLE_API_KEY="sua_chave_aqui"
export CORS_ORIGINS="http://localhost:3000,https://joaomanoel123.github.io"
```

3. **Executar API**:
```bash
uvicorn main:app --reload
```

## 📡 Endpoints

### `GET /`
Informações da API

### `GET /health`
Status da API e configurações
```json
{
  "status": "ok",
  "environment": "production",
  "api_configured": true
}
```

### `POST /command`
Enviar comando para o assistente
```json
{
  "message": "Olá, como você está?"
}
```

Resposta:
```json
{
  "reply": "Olá! Eu sou JARVIS, estou funcionando perfeitamente..."
}
```

## 🔐 Segurança

- ✅ CORS configurado para GitHub Pages
- ✅ API Key protegida em variáveis de ambiente
- ✅ Validação de entrada
- ✅ Tratamento de erros

## 🧪 Testes

```bash
# Testar health
curl https://jarvis-tdgt.onrender.com/health

# Testar comando
curl -X POST https://jarvis-tdgt.onrender.com/command \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá JARVIS"}'
```

## 📊 Monitoramento

- **Logs**: Render Dashboard
- **Métricas**: Render Dashboard  
- **Uptime**: Status page do Render

## ⚠️ Limitações do Free Tier

- **Cold Start**: ~30 segundos após inatividade
- **Timeout**: 30 segundos por request
- **Memória**: 512MB
- **Horas**: 750h/mês

---

**Status**: ✅ Configurado para produção  
**Última atualização**: 2025-08-10