const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

app.use(express.static('dist/planning-poker-app'));

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


server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
