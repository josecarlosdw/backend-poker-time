const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static('dist/planning-poker-app'));
app.use(express.json());

// Lista de participantes na sala
const participants = [];

function findDisconnectedParticipant(socketId) {
  return participants.find((participant) => participant.socketId === socketId);
}

// Rota para criar uma sala
app.post('/api/rooms', (req, res) => {
  try {
    const { roomCode } = req.body;

    // Carrega o conteúdo do arquivo JSON
    const roomsData = JSON.parse(fs.readFileSync('rooms.json'));

    // Verifica se a sala já existe no arquivo
    const existingRoom = roomsData.find((room) => room.roomCode === roomCode);
    if (existingRoom) {
      return res.status(400).json({ message: 'Sala já existe' });
    }

    // Adiciona a nova sala ao array no arquivo
    roomsData.push({ roomCode });
    fs.writeFileSync('rooms.json', JSON.stringify(roomsData, null, 2));

    return res.status(201).json({ message: 'Sala criada com sucesso', room: { roomCode } });
  } catch (error) {
    console.error('Erro ao criar a sala:', error);
    return res.status(500).json({ message: 'Erro ao criar a sala' });
  }
});

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


server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
