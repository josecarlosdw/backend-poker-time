import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface Room {
  _id: string;
  name: string;
  description?: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  participants: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: 'participant' | 'observer' | 'moderator';
    joinedAt: string;
  }>;
  isActive: boolean;
  isPrivate: boolean;
  inviteCode?: string;
  settings: {
    cardSet: string[];
    allowObservers: boolean;
    autoReveal: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
  settings?: {
    cardSet?: string[];
    allowObservers?: boolean;
    autoReveal?: boolean;
  };
  relatedTask?: string;
  invitedUsers?: string[];
}

export interface JoinRoomRequest {
  inviteCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(
    private http: HttpClient
  ) {}

  createRoom(request: CreateRoomRequest): Observable<Room> {
    return this.http.post<{ message: string; room: Room }>(`${environment.apiUrl}/rooms`, request)
      .pipe(
        map(response => response.room),
        catchError(this.handleError)
      );
  }

  getRooms(): Observable<Room[]> {
    return this.http.get<{ rooms: Room[] }>(`${environment.apiUrl}/rooms`)
      .pipe(
        map(response => response.rooms),
        catchError(this.handleError)
      );
  }

  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<{ room: Room }>(`${environment.apiUrl}/rooms/${roomId}`)
      .pipe(
        map(response => response.room),
        catchError(this.handleError)
      );
  }

  joinRoom(request: JoinRoomRequest): Observable<Room> {
    return this.http.post<{ message: string; room: Room }>(`${environment.apiUrl}/rooms/join`, request)
      .pipe(
        map(response => response.room),
        catchError(this.handleError)
      );
  }

  updateRoom(roomId: string, updates: Partial<CreateRoomRequest>): Observable<Room> {
    return this.http.put<{ message: string; room: Room }>(`${environment.apiUrl}/rooms/${roomId}`, updates)
      .pipe(
        map(response => response.room),
        catchError(this.handleError)
      );
  }

  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/rooms/${roomId}`)
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  searchUsers(query: string): Observable<{ _id: string; username: string; email: string }[]> {
    return this.http.get<{ users: { _id: string; username: string; email: string }[] }>(`${environment.apiUrl}/auth/search?q=${encodeURIComponent(query)}`)
      .pipe(
        map(response => response.users),
        catchError(this.handleError)
      );
  }

  getExternalTasks(): Observable<{ id: string; title: string; status: string }[]> {
    return this.http.get<{ tasks: { id: string; title: string; status: string }[] }>(`${environment.apiUrl}/rooms/tasks`)
      .pipe(
        map(response => response.tasks),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Room service error:', error);
    return throwError(() => error.error?.message || 'An error occurred');
  }
} 