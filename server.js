const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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

// Objeto para armazenar temporariamente os detalhes da sala
const rooms = {};

// Objeto para armazenar temporariamente os detalhes da sala
const temporaryRooms = {};

// Rota para criar uma nova sala temporária
app.post('/api/criarSalaTemporaria', (req, res) => {
  const roomCode = uuidv4(); // Gerar um código único usando UUIDv4
  const sala = {
    nome: 'Nova Sala',
    descricao: 'Descrição da nova sala',
    participantes: [],
  };

  rooms[roomCode] = sala; // Armazena os detalhes da sala no objeto rooms

  res.status(201).json(sala); // Retorna os detalhes da sala como resposta JSON
});

// Rota para obter os detalhes da sala com base no código da sala
app.get('/api/sala/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  const sala = rooms[roomCode];

  if (sala) {
    res.json(sala); // Retorna os detalhes da sala como resposta JSON
  } else {
    res.status(404).json({ error: 'Sala não encontrada' }); // Retorna erro 404 se a sala não existir
  }
});

// Adicionar o middleware para analisar o corpo da solicitação como JSON
app.use(express.json());
app.use(express.static('dist/planning-poker-app'));

app.get('/api/salas', async (req, res) => {
  try {
    const snapshot = await db.collection('salas').get();
    const salas = snapshot.docs.map((doc) => doc.data());

    res.json(salas);
  } catch (err) {
    console.error('Erro ao obter as salas:', err);
    res.status(500).json({ error: 'Erro ao obter as salas' });
  }
});

app.post('/api/salas', async (req, res) => {
  const { nome, descricao } = req.body;

  try {
    // Gerar um código único usando UUID
    const roomCode = uuidv4();

    // Adicione a sala ao Firebase
    const salaRef = db.collection('salas').doc(roomCode);
    await salaRef.set({ nome, descricao });

    const sala = {
      nome,
      descricao,
      roomCode
    };

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
    const salaRef = await db.collection('salas').doc(roomCode).get();
    if (!salaRef.exists) {
      // Caso a sala não seja encontrada, retornar um erro 404
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    const sala = salaRef.data();

    res.json(sala);
  } catch (err) {
    console.error('Erro ao buscar a sala:', err);
    res.status(500).json({ error: 'Erro ao buscar a sala' });
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

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});