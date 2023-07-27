const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

/* const io = socketIO(server, { cors: {
  credentials: true,
  origin: '*',
} }); */


const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }
});

const { Pool } = require('pg');

// Configurações de conexão fornecidas pelo ElephantSQL
const pool = new Pool({
  user: 'ewtixgnc',
  host: 'postgres://ewtixgnc:Mejvz768-LLtyWABgmzp4lYgzc2TzgSz@silly.db.elephantsql.com/ewtixgnc',
  database: 'ewtixgnc',
  password: 'Mejvz768-LLtyWABgmzp4lYgzc2TzgSz',
  port: 5432, // A porta padrão do PostgreSQL é 5432
});

/* const socket = io('https://poker-time-oep1.onrender.com', {
  transports: ['polling', 'websocket'],
}); */

const cors = require('cors');
app.use(cors());

// Adicionar middleware para permitir CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://poker-time-oep1.onrender.com');
  // Outras configurações de CORS, se necessário
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});


// Adicionar o middleware para analisar o corpo da solicitação como JSON
app.use(express.json());

app.use(express.static('dist/planning-poker-app'));

// Rota para buscar todas as salas
app.get('/api/salas', async (req, res) => {
  try {
    const salas = await getRooms();
    res.json(salas);
  } catch (err) {
    console.error('Erro ao obter as salas:', err);
    res.status(500).json({ error: 'Erro ao obter as salas' });
  }
});

// Rota para criar uma nova sala
app.post('/api/salas', async (req, res) => {
  const { nome, descricao } = req.body;
  try {
    const sala = await createRoom({ nome, descricao });
    res.status(201).json(sala);
  } catch (err) {
    console.error('Erro ao criar a sala:', err);
    res.status(500).json({ error: 'Erro ao criar a sala' });
  }
});

// Lista de participantes na sala
const participants = [];

function findDisconnectedParticipant(socketId) {
  return participants.find((participant) => participant.socketId === socketId);
}

io.on('connection', (socket) => {
  socket.on('vote', (data) => {
    const { participant, vote } = data;
    console.log(`Participante votou: ${participant} - Voto: ${vote}`);
    io.emit('vote', { participant, vote }); // Emitir apenas as propriedades necessárias
  });

  socket.on('disconnect', () => {
    console.log('Participante desconectado');
    // Emitir evento participantLeft com o nome do participante desconectado
    const disconnectedParticipant = findDisconnectedParticipant(socket.id);
    if (disconnectedParticipant) {
      io.emit('participantLeft', disconnectedParticipant.name);
    }
  });

  console.log('Novo participante conectado');
  // Emitir evento participantJoined com os dados do novo participante
  socket.on('joinRoom', (participant) => {
    io.emit('participantJoined', participant);
  });
});

// Exemplo de consulta ao banco de dados
async function getRooms() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM salas');
    return result.rows;
  } catch (err) {
    console.error('Erro ao obter as salas:', err);
    return [];
  } finally {
    client.release();
  }
}

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
