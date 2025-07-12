
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { io, Socket } from 'socket.io-client';


@Component({
  selector: 'app-planning-poker-main',
   templateUrl: './planning-poker-main.component.html',
  styleUrls: ['./planning-poker-main.component.css']
})
export class PlanningPokerMainComponent implements OnInit {

  socket!: Socket;

  @Input() username: string = '';
  @Input() roomName: string = '';
  @Input() selectedCard: string = '';
 

  cards: string[] = ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100'];

  constructor( private router: Router, private routeActivated: ActivatedRoute) { 
    this.socket = io('http://localhost:3000');
   
  }

  ngOnInit() {
    this.selectedCard = '';

    this.routeActivated.queryParams.subscribe(params => {
      this.username = params['username'];
      this.roomName = params['roomName'];
    });
    
  }

  selectCard(card: string) {
    this.selectedCard = card;
    this.socket.emit('selectCard', { selectedCard: this.selectedCard });
  }

  sendCard() {
    // Send the data to the next screen through the route
    this.router.navigate(['/list'], {
      queryParams: {
        selectedCard: this.selectedCard,
        username: this.username,
        roomName: this.roomName
      }
    });
  
    this.socket.emit('sendCard', {
      selectedCard: this.selectedCard,
      username: this.username,
      roomName: this.roomName
    });
  }

  resetCards() {
    this.selectedCard = '';
  }

  isCardSelected(card: string): boolean {
    return this.selectedCard === card;
  }
}