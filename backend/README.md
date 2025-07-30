# Planning Poker Backend

Backend moderno para aplicação Planning Poker com Node.js, Express, MongoDB e Socket.IO.

## 🚀 Funcionalidades

- **Autenticação JWT** - Sistema completo de registro e login
- **Gerenciamento de Salas** - Criar, editar e gerenciar salas de planning poker
- **Sessões de Votação** - Criar e gerenciar sessões de estimativa
- **WebSocket em Tempo Real** - Comunicação em tempo real entre participantes
- **Validação de Dados** - Validação robusta com express-validator
- **Rate Limiting** - Proteção contra ataques de spam
- **Logging Estruturado** - Sistema de logs com Winston
- **Segurança** - Helmet, CORS configurado, sanitização de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB (opcional para desenvolvimento)
- npm ou yarn

## 🛠️ Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp env.example .env
   ```

3. **Editar .env com suas configurações:**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/planning-poker
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:4200
   ```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual

### Salas
- `POST /api/rooms` - Criar sala
- `GET /api/rooms` - Listar salas do usuário
- `GET /api/rooms/:roomId` - Obter sala específica
- `POST /api/rooms/join` - Entrar em sala por código
- `PUT /api/rooms/:roomId` - Atualizar sala
- `DELETE /api/rooms/:roomId` - Deletar sala

### Sessões
- `POST /api/sessions` - Criar sessão
- `GET /api/sessions/room/:roomId` - Listar sessões da sala
- `GET /api/sessions/:sessionId` - Obter sessão específica
- `POST /api/sessions/:sessionId/vote` - Votar
- `POST /api/sessions/:sessionId/start` - Iniciar votação
- `POST /api/sessions/:sessionId/reveal` - Revelar votos
- `POST /api/sessions/:sessionId/complete` - Finalizar sessão

## 🔌 WebSocket Events

### Cliente → Servidor
- `joinRoom` - Entrar em uma sala
- `vote` - Enviar voto
- `revealVotes` - Revelar votos
- `chatMessage` - Enviar mensagem no chat

### Servidor → Cliente
- `userJoined` - Usuário entrou na sala
- `userLeft` - Usuário saiu da sala
- `voteReceived` - Voto recebido
- `votesRevealed` - Votos revelados
- `chatMessage` - Mensagem do chat

## 🧪 Testes

```bash
npm test
```

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (banco, etc.)
├── controllers/     # Controladores da API
├── middleware/      # Middlewares (auth, validação)
├── models/          # Modelos do MongoDB
├── routes/          # Rotas da API
├── utils/           # Utilitários (logger, etc.)
└── server.js        # Servidor principal
```

## 🔧 Configuração do MongoDB

### Opcional para Desenvolvimento
O backend pode rodar sem MongoDB em modo de desenvolvimento. Apenas deixe `MONGODB_URI` vazio no `.env`.

### Para Produção
1. Instale MongoDB
2. Configure a URI no `.env`
3. O servidor irá conectar automaticamente

## 📝 Logs

Os logs são salvos em:
- `logs/error.log` - Erros
- `logs/combined.log` - Todos os logs

## 🔒 Segurança

- JWT para autenticação
- Rate limiting
- Validação de dados
- Sanitização de inputs
- CORS configurado
- Headers de segurança com Helmet

## 🚀 Próximos Passos

1. Integrar com frontend Angular
2. Adicionar testes automatizados
3. Implementar notificações por email
4. Adicionar métricas e monitoramento
5. Configurar CI/CD 