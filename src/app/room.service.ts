import { Injectable } from '@angular/core';
import { Room } from './room.model';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class RoomService {
  private rooms: Room[] = [];
  private users: { username: string, selectedCard: string }[] = [];

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
    this.registerSocketEvents();
  }

  private registerSocketEvents() {
    this.socket.on('userJoined', (user: { username: string, selectedCard: string }) => {
      this.addUser(user.username, user.selectedCard);
    });

    this.socket.on('userLeft', (username: string) => {
      this.removeUser(username);
    });
  }

  addUser(username: string, selectedCard: string) {
    this.users.push({ username, selectedCard });
  }

  removeUser(username: string) {
    this.users = this.users.filter(user => user.username !== username);
  }

  getUsers() {
    return this.users;
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  addRoom(room: Room) {
    this.rooms.push(room);
  }
}
