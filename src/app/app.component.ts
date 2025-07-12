import { Component, Input } from '@angular/core';
import { RoomService } from './room.service';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  socket!: Socket;
  @Input() selectedCard: string = '';

  constructor(private roomService: RoomService) {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('userConnected', (username: string) => {
      this.roomService.addUser(username, this.selectedCard);
    });

    this.socket.on('userDisconnected', (username: string) => {
      this.roomService.removeUser(username);
    });
  }
}
