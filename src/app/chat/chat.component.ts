import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

import { WebSocketService, ChatMessage } from '../services/websocket.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() roomId!: string;
  messages: ChatMessage[] = [];
  chatForm: FormGroup;
  currentUser: any = null;
  private subs: Subscription[] = [];

  constructor(
    private ws: WebSocketService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.chatForm = this.formBuilder.group({
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    this.subs.push(
      this.ws.onChatMessage().subscribe(msg => {
        this.messages.push(msg);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  sendMessage(): void {
    if (this.chatForm.invalid || !this.roomId || !this.currentUser) return;
    const message = this.chatForm.value.message;
    this.ws.sendChatMessage(this.roomId, this.currentUser.username, message);
    this.chatForm.reset();
  }
}
