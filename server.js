const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    credentials: true,
    origin: '*',
  },
});

// Use o middleware do cors
app.use(cors());

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Configurações de conexão fornecidas pelo ElephantSQL
//postgres://ewtixgnc:Mejvz768-LLtyWABgmzp4lYgzc2TzgSz@silly.db.elephantsql.com/ewtixgnc
const pool = new Pool({
  user: 'ewtixgnc',
  host: 'silly.db.elephantsql.com',
  database: 'ewtixgnc',
  password: 'Mejvz768-LLtyWABgmzp4lYgzc2TzgSz',
  port: 5432, // A porta padrão do PostgreSQL é 5432
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

/// Rota para criar uma nova sala
app.post('/api/salas', async (req, res) => {
  const { nome, descricao } = req.body;
  try {
    // Gerar um código único usando UUID
    const roomCode = uuidv4();

    // Atribuir o mesmo valor do UUID tanto para o campo 'nome' quanto para o campo 'room_code'
    const sala = await createRoom({ nome: roomCode, descricao, roomCode });

    res.status(201).json(sala);
  } catch (err) {
    console.error('Erro ao criar a sala:', err);
    res.status(500).json({ error: 'Erro ao criar a sala' });
  }
});

// Rota para buscar uma sala pelo código
app.get('/api/salas/:roomCode', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const sala = await getRoomByCode(roomCode);
    console.log('Sala encontrada:', sala); // Adicione este log para verificar se a sala foi encontrada
    if (!sala) {
      // Caso a sala não seja encontrada, retornar um erro 404
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    res.json(sala);
  } catch (err) {
    console.error('Erro ao buscar a sala:', err);
    res.status(500).json({ error: 'Erro ao buscar a sala' });
  }
});

// Função para criar uma nova sala no banco de dados
async function createRoom({ nome, descricao, roomCode }) {
  const client = await pool.connect();
  try {
    // Inserir os dados da sala no banco de dados
    const query = 'INSERT INTO salas (nome, descricao, room_code) VALUES ($1, $2, $3) RETURNING *';
    const values = [nome, descricao, roomCode];
    const result = await client.query(query, values);

    return result.rows[0];
  } catch (err) {
    console.error('Erro ao criar a sala:', err);
    throw err; // Propagar o erro para o manipulador de rotas
  } finally {
    client.release();
  }
}

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

// Função para buscar uma sala pelo código no banco de dados
async function getRoomByCode(roomCode) {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM salas WHERE room_code = $1';
    const values = [roomCode];
    const result = await client.query(query, values);

    return result.rows[0];
  } catch (err) {
    console.error('Erro ao buscar a sala:', err);
    throw err; // Propagar o erro para o manipulador de rotas
  } finally {
    client.release();
  }
}


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

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
