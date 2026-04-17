# 🛒 Oliver's RH Pro

Sistema de Gestão de Recursos Humanos para o Oliver's Supermercado — Franca/SP.

## ✨ Funcionalidades

- **Dashboard Executivo** — KPIs, radar de desempenho por setor, alertas, funcionário destaque
- **Meu Dia** — Checklist diário, anotações, contador de pagamento
- **Gestão de Funcionários** — Cadastro completo, cards com semáforo de risco
- **Folha & Custos** — Análise de custo com encargos, simulador de aumento salarial
- **Ocorrências & Conflitos** — Registro e acompanhamento de situações disciplinares
- **Headcount** — Cobertura por setor, análise de capacidade
- **Relatórios IA** — Análises geradas pela Anthropic Claude
- **Olivia (Assistente IA)** — Chat com especialista em CLT e RH de supermercado

---

## 🚀 Como subir no Vercel (passo a passo)

### 1. Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"** → dê o nome `olivers-rh`
3. Desative o Google Analytics (opcional) → **Criar projeto**
4. No menu lateral, clique em **"Firestore Database"** → **Criar banco de dados** → escolha **Modo de produção** → selecione região `us-east1` → **Ativar**
5. No menu lateral, clique em **"Authentication"** → **Começar** → ative o provedor **Google** → salve
6. Clique na engrenagem ⚙️ → **Configurações do projeto** → role até **"Seus aplicativos"** → clique em **`</>`** (web)
7. Registre o app com o nome `olivers-rh-web`
8. Copie os valores do `firebaseConfig` mostrados

### 2. Configurar regras do Firestore

No console Firebase → Firestore → aba **Regras**, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Clique em **Publicar**.

### 3. Subir o código no GitHub

1. Crie uma conta em [github.com](https://github.com) se não tiver
2. Clique em **"New repository"** → nome: `olivers-rh` → **Create repository**
3. No seu computador, dentro da pasta `olivers-rh`:

```bash
git init
git add .
git commit -m "Oliver's RH Pro - versão inicial"
git remote add origin https://github.com/SEU_USUARIO/olivers-rh.git
git push -u origin main
```

### 4. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Clique em **"Add New Project"** → selecione o repositório `olivers-rh`
3. Clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `VITE_FIREBASE_API_KEY` | (do passo 1) |
| `VITE_FIREBASE_AUTH_DOMAIN` | (do passo 1) |
| `VITE_FIREBASE_PROJECT_ID` | (do passo 1) |
| `VITE_FIREBASE_STORAGE_BUCKET` | (do passo 1) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (do passo 1) |
| `VITE_FIREBASE_APP_ID` | (do passo 1) |
| `VITE_ANTHROPIC_API_KEY` | Sua chave da Anthropic |

4. Clique em **"Deploy"** → aguarde ~2 minutos
5. Seu site estará em `https://olivers-rh.vercel.app` (ou URL gerada)

### 5. Adicionar domínio autorizado no Firebase

1. Firebase Console → Authentication → **Settings** → **Authorized domains**
2. Clique em **"Add domain"** → cole a URL do Vercel → **Add**

---

## 🔑 Como obter a chave da Anthropic

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Menu lateral → **API Keys** → **Create Key**
3. Copie a chave (começa com `sk-ant-...`)
4. Cole em `VITE_ANTHROPIC_API_KEY` no Vercel

---

## 📁 Estrutura do projeto

```
olivers-rh/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Sidebar de navegação
│   ├── contexts/
│   │   └── AuthContext.jsx     # Autenticação Google
│   ├── lib/
│   │   └── firebase.js         # Conexão com Firebase
│   ├── pages/
│   │   ├── Login.jsx           # Tela de login
│   │   ├── Dashboard.jsx       # Painel executivo
│   │   ├── Funcionarios.jsx    # Gestão de pessoas
│   │   ├── Folha.jsx           # Custos e folha
│   │   ├── Ocorrencias.jsx     # Conflitos e ocorrências
│   │   ├── Assistente.jsx      # Chat com Olivia (IA)
│   │   └── Others.jsx          # Meu Dia, Headcount, Relatórios
│   ├── App.jsx                 # Rotas
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## 🔄 Atualizações futuras

Para atualizar o sistema, basta fazer push no GitHub — o Vercel faz deploy automático:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

---

## 🤝 Suporte

Este sistema foi construído em parceria com Claude (Anthropic).  
Para melhorias ou ajustes, basta abrir uma conversa com Claude e pedir alterações — ele pode acessar e modificar o código a qualquer momento.

**Versão:** 1.0.0  
**Data:** Abril 2026  
**Empresa:** Oliver's Supermercado · Franca/SP
