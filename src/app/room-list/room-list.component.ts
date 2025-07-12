import { Component, OnInit, Input } from '@angular/core';
import { RoomService } from '../room.service';
import { Room } from '../room.model';
import { ActivatedRoute } from '@angular/router';
import { io, Socket } from 'socket.io-client';




interface Message {
  sender: string;
  content: string;
  selectedCard?: string;
}

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})

export class RoomListComponent implements OnInit {
  socket!: Socket;

  //users: string[] = []
  users: { username: string, selectedCard: string }[] = [];
  average: number = 0;

  
  usernames: string[] = [];


  @Input() username: string = '';
  @Input() roomName: string = '';
  @Input() selectedCard: string = '';

  message!: string;
  messages: Message[] = [];

  //users: any[] = [];

  constructor(private route: ActivatedRoute, private roomService: RoomService) {

    this.socket = io('http://localhost:3000');
 
   }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
      this.roomName = params['roomName'];
      this.selectedCard = params['selectedCard'];
    });
    
    this.users = this.roomService.getUsers();
  }

  calculateAverage() {
    const numericMessages = this.messages
      .map(message => Number(message.content))
      .filter(value => !isNaN(value));
  
    if (numericMessages.length > 0) {
      const sum = numericMessages.reduce((acc, val) => acc + val, 0);
      const average = sum / numericMessages.length;
      alert(`Average: ${average}`);
    } else {
      alert('No numeric values found');
    }
  
    const data = { username: this.username, selectedCard: this.selectedCard };
    this.socket.emit('usernameAndCard', data);
  }

  ngOnDestroy() {
   
  }

}
