import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../room.service';
import { Room } from '../room.model';
import { EmailService } from '../email.service';
import { Route, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { io, Socket } from 'socket.io-client';


@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent implements OnInit {

  socket!: Socket;

  @Input() username: string = '';
  @Input() roomName: string = '';
  @Input() selectedCard: string = '';

  roomForm!: FormGroup;
  positions: string[] = ['Posição 1', 'Posição 2', 'Posição 3', 'Posição 4'];

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private router: Router, 
    private route: ActivatedRoute
    
  ) {
    this.socket = io('http://localhost:3000');
   }

  ngOnInit() {
    this.roomForm = this.formBuilder.group({
      username: ['', Validators.required],
      roomName: ['', Validators.required],
      name: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      this.username = params.username;
    });
  }

  sendData() {
   /*  if (this.roomForm.invalid) {
      // Form validation failed, display error messages or handle accordingly
      return;
    } */

    /* this.username = this.roomForm.value.username;
    this.roomName = this.roomForm.value.roomName; */

    // Send the data to the next screen through the route

    const username = this.roomForm.get('name')?.value;
    this.roomService.addUser(username, this.selectedCard );

    this.router.navigate(['/create'], {
      queryParams: {
        username: this.username,
        roomName: this.roomName
      }
    });

    this.socket.emit('sendData', { username: this.username });

  }

}
