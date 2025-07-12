import { Component, OnInit, Input } from '@angular/core';
import { io, Socket } from 'socket.io-client';

interface Message {
  username: string;
  sender: string;
  content: string;
  selectedCard?: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  messages: Message[] = [];
  private socket: Socket;
  message!: string;

  @Input() username: string = '';
  @Input() roomName: string = '';
  @Input() selectedCard: string = '';

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.socket.on('chatMessage', (message: Message) => {
      this.messages.push(message);
    });

    this.socket.on('calculateAverage', () => {
      this.calculateAverage();
    });
  }

  sendMessage() {
    const message: Message = {
      sender: this.username,
      content: this.message,
      selectedCard: this.selectedCard,
      username: this.username
    };

    // Send the message to the server
    this.socket.emit('chatMessage', message);

    // Emit the 'calculateAverage' event to request the calculation of the selectedCards average
    this.socket.emit('calculateAverage');

    // Clear the message field
    this.message = '';
  }

  calculateAverage() {
    const numericCards = this.messages
      .filter((message: Message) => !isNaN(parseFloat(message.selectedCard || '')))
      .map((message: Message) => parseFloat(message.selectedCard || ''));
  
    if (numericCards.length > 0) {
      const sum = numericCards.reduce((acc, card) => acc + card, 0);
      const average = sum / numericCards.length;
  
      console.log('Average:', average);
    } else {
      console.log('No numeric values found');
    }
  }
}
