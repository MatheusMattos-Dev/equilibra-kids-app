# 🚀 Equilibra Kids

O **Equilibra Kids** é uma aplicação web progressiva (PWA) e gamificada desenvolvida para ajudar pais e responsáveis a gerenciar de forma saudável e interativa o tempo de tela das crianças. O app combina controle parental inteligente com incentivo a atividades do mundo real (missões físicas, artísticas e intelectuais), transformando o gerenciamento do tempo de tela em uma experiência divertida de conquistas.

---

## 🌟 Recursos Principais

### 📱 Console dos Pais (`/pais`)
* **Monitor de Dispositivos em Tempo Real**: Veja quais filhos estão online, o tempo restante e o progresso em relação ao limite diário.
* **Controle Remoto Instantâneo**:
  * **Pausar/Retomar**: Pause a sessão da criança imediatamente de forma remota.
  * **Bloquear**: Interrompa o acesso ao dispositivo instantaneamente.
  * **Presentear com Tempo Extra**: Adicione 15 minutos adicionais com um clique.
* **Aprovação de Pedidos**: Aprove ou recuse pedidos de tempo extra enviados pelas crianças diretamente do console.
* **Configuração de Limites Personalizados**: Defina limites diários de tempo, horário de início e fim permitido para uso e horário de dormir (bedtime) individual.
* **Gerenciador de Missões**: Crie e delete missões customizadas que as crianças podem realizar offline para ganhar recompensas.
* **Histórico de Uso**: Visualize relatórios e médias semanais de uso com diagnósticos claros baseados em diretrizes pediátricas.
* **E-mail Digest**: Configure e simule o recebimento de relatórios consolidados semanais por e-mail (incluindo alertas e rankings).
* **Modo Turbo (Simulador Acelerado)**: Acelere a contagem de tempo de uso das crianças (onde **1 segundo real equivale a 1 minuto no app**) para testar os avisos de limite (15 min restantes, 5 min restantes) e os bloqueios em tempo real.

### 🧒 Interface das Crianças (`/crianca`)
* **Ambiente Lúdico e Colorido**: Uma interface amigável com avatares fofos (Leão, Coruja, Gato, Urso).
* **Visualização do Tempo Restante**: Acompanhe de forma simples quanto tempo de uso ainda resta.
* **Estação de Descanso Real**: Uma seleção de missões offline divertidas para fazer no mundo real (ex: desenhar um super-herói, ler um livro, beber água, brincar ao ar livre) que bonificam a criança com estrelas.
* **Pedidos de Tempo Extra**: Envie uma notificação de solicitação de mais tempo de tela diretamente para o console dos pais.
* **Modo Sono**: Alertas animados que guiam a criança na hora de dormir.

### ⚡ Resiliência Offline e PWA
* **Persistência de Dados**: Graças ao Firebase Firestore local cache, o aplicativo funciona de maneira transparente mesmo sem conexão com a internet.
* **Notificação Offline**: Alerta os pais quando o aplicativo está rodando em modo offline, sincronizando tudo automaticamente assim que a conexão é restabelecida.
* **Aplicativo Instalável (PWA)**: Pode ser adicionado à tela inicial de celulares e tablets com suporte a atualizações de service worker em tempo real.

---

## 🛠️ Tecnologias Utilizadas

* **Vite 8 & React 19**: Ferramental moderno e rápido com a última versão do React para uma experiência ultrafluida.
* **TypeScript**: Tipagem estática garantindo robustez e menos bugs em tempo de execução.
* **Tailwind CSS v4**: Nova geração do framework de estilização configurado diretamente via plugin nativo do Vite (`@tailwindcss/vite`).
* **Firebase Suite**:
  * **Firebase Auth**: Registro e autenticação segura para as contas dos pais.
  * **Firestore**: Banco de dados não relacional em tempo real estruturado para sincronizar configurações, perfis e históricos, com suporte a múltiplas abas e cache local offline ativo.
  * **Firebase Cloud Messaging (FCM)**: Estruturado para enviar e receber notificações push remotas.
* **Lucide React**: Biblioteca de ícones modernos e minimalistas.
* **Vite Plugin PWA**: Habilita o comportamento PWA, manifest.json e registro de Service Worker.

---

## 📁 Estrutura do Projeto

Abaixo está o layout das principais pastas e arquivos contidos no diretório `src`:

```text
src/
├── assets/             # Recursos estáticos (imagens, ícones)
├── components/         # Componentes UI reutilizáveis
│   ├── Avatar.tsx              # Componente que renderiza os avatares lúdicos das crianças
│   ├── HealthAlertCard.tsx     # Exibição de alertas de saúde para o console dos pais
│   ├── InstallPrompt.tsx       # Banner de instalação do PWA
│   ├── OfflineActivities.tsx   # Painel com as missões de descanso da criança
│   ├── ParentPinModal.tsx      # Modal de validação de PIN de segurança dos pais
│   └── ProtectedRoute.tsx      # Validação de rotas autenticadas (Firebase Auth)
├── hooks/              # Custom Hooks com as regras de negócio
│   ├── useAuth.ts              # Controle de autenticação com o Firebase Auth
│   ├── useOnlineStatus.ts      # Monitor de conexão com a internet
│   ├── usePushNotifications.ts # Controle e hooks para notificações Push
│   └── useScreenTime.tsx       # Toda a lógica de sincronização remota, contagem de tempo e limites
├── lib/                # Arquivos de inicialização de bibliotecas externas
│   └── firebase.ts             # Configuração e inicialização do ecossistema Firebase
├── pages/              # Telas da aplicação
│   ├── AuthPage.tsx            # Tela de Login e Registro dos pais
│   ├── ChildInterface.tsx      # Estação lúdica da Criança
│   ├── ParentDashboard.tsx     # Console completo do Responsável
│   └── ProfileSelection.tsx    # Tela de boas-vindas para seleção de perfil
├── App.tsx             # Arquivo raiz de rotas (React Router v7)
├── index.css           # Estilização global e tokens Tailwind CSS v4
└── main.tsx            # Ponto de entrada do React
```

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Passo 1: Clonar o Repositório e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd equilibra-kids-app
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto contendo as credenciais de acesso do seu projeto Firebase (use o arquivo `.env.example` como modelo):

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_VAPID_KEY=sua_vapid_key_para_push_notifications
```

### Passo 3: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse o endereço exibido no terminal (geralmente [http://localhost:5173](http://localhost:5173)) para utilizar a aplicação.

### Passo 4: Construir para Produção (Build)
Para compilar e otimizar a aplicação para distribuição em produção, execute:
```bash
npm run build
```
O build otimizado será gerado na pasta `dist/`, pronto para ser implantado em serviços de hospedagem como Firebase Hosting, Vercel ou Netlify.
