import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: Date;
}

export interface VoteData {
  username: string;
  card: string;
}

export interface UserJoinedData {
  username: string;
  roomId: string;
}

export interface UserLeftData {
  username: string;
  roomId: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor() {}

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(environment.wsUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.connectedSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectedSubject.next(false);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSubject.next(false);
    }
  }

  joinRoom(roomId: string, username: string): void {
    if (this.socket?.connected) {
      this.socket.emit('joinRoom', { roomId, username });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leaveRoom', { roomId });
    }
  }

  sendVote(roomId: string, username: string, card: string): void {
    if (this.socket?.connected) {
      this.socket.emit('vote', { roomId, username, card });
    }
  }

  revealVotes(roomId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('revealVotes', { roomId });
    }
  }

  sendChatMessage(roomId: string, username: string, message: string): void {
    if (this.socket?.connected) {
      this.socket.emit('chatMessage', { roomId, username, message });
    }
  }

  // Event listeners
  onUserJoined(): Observable<UserJoinedData> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('userJoined', (data: UserJoinedData) => {
          observer.next(data);
        });
      }
    });
  }

  onUserLeft(): Observable<UserLeftData> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('userLeft', (data: UserLeftData) => {
          observer.next(data);
        });
      }
    });
  }

  onVoteReceived(): Observable<VoteData> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('voteReceived', (data: VoteData) => {
          observer.next(data);
        });
      }
    });
  }

  onVotesRevealed(): Observable<void> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('votesRevealed', () => {
          observer.next();
        });
      }
    });
  }

  onChatMessage(): Observable<ChatMessage> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('chatMessage', (data: ChatMessage) => {
          observer.next(data);
        });
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
} 