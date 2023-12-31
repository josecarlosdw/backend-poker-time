const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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
app.use(express.json());
app.use(express.static('dist/planning-poker-app'));

// Caminho para o arquivo JSON que irá armazenar as salas
const salasFilePath = './salas.json';

// Função para ler o arquivo JSON e retornar os dados das salas
function readSalasFile() {
  try {
    const data = fs.readFile(salasFilePath, 'utf-8');
    console.log('data readfile', data); // Log para verificar o conteúdo lido
    console.log('data salasFilePath em readfile ', salasFilePath); // Log para verificar o caminho do arquivo
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler o arquivo de salas:', err);
    return [];
  }
}

// Função para gravar os dados das salas no arquivo JSON
function writeSalasFile(salas) {
  try {
    fs.writeFile(salasFilePath, JSON.stringify(salas, null, 2), 'utf-8');
    console.log('data writeFileSync', data); // Log para verificar o conteúdo gravado
    console.log('data salasFilePath em writeSalasFile ', salasFilePath); // Log para verificar o caminho do arquivo
  } catch (err) {
    console.error('Erro ao gravar o arquivo de salas:', err);
  }
}

// Rota para criar uma nova sala temporária
app.post('/api/criarSalaTemporaria', (req, res) => {
  const roomCode = uuidv4(); // Gerar um código único usando UUIDv4
  const novaSala = {
    id: 0,
    nome: 'Nova Sala',
    descricao: 'Descrição da nova sala',
    room_code: roomCode,
  };

  const salas = readSalasFile();
  salas.push(novaSala);
  writeSalasFile(salas);

  res.status(201).json(novaSala); // Retorna os detalhes da sala como resposta JSON
});

// Rota para obter os detalhes da sala com base no código da sala
app.get('/api/sala/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  const salas = readSalasFile();
  const sala = salas.find(s => s.room_code === roomCode);

  if (sala) {
    res.json(sala); // Retorna os detalhes da sala como resposta JSON
  } else {
    res.status(404).json({ error: 'Sala não encontrada' }); // Retorna erro 404 se a sala não existir
  }
});

// Lista de participantes na sala
const participants = [];

function findDisconnectedParticipant(socketId) {
  return participants.find((participant) => participant.socketId === socketId);
}
  

io.on('connection', (socket) => {
  console.log('Novo participante conectado');

  socket.on('joinRoom', (participant) => {
    participants.push(participant); // Adicionar o novo participante à lista de participantes

    // Emitir a lista de todos os participantes para o novo participante
    io.to(socket.id).emit('allParticipants', participants);

    // Emitir evento participantJoined para todos os outros participantes
    socket.broadcast.emit('participantJoined', participant);
  });

  socket.on('vote', (data) => {
    const { participant, vote } = data;
    console.log(`Participante votou: ${participant} - Voto: ${vote}`);
    io.emit('vote', { participant, vote });
  });

  socket.on('disconnect', () => {
    console.log('Participante desconectado');
    const disconnectedParticipant = findDisconnectedParticipant(socket.id);
    if (disconnectedParticipant) {
      // Remover o participante desconectado da lista de participantes
      participants.splice(participants.indexOf(disconnectedParticipant), 1);
      
      // Emitir a lista atualizada de participantes para todos os outros participantes
      socket.broadcast.emit('allParticipants', participants);

      io.emit('participantLeft', disconnectedParticipant.name);
    }
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});