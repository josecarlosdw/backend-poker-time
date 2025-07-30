import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface Session {
  _id: string;
  room: string;
  title: string;
  description?: string;
  status: 'active' | 'voting' | 'revealed' | 'completed';
  votes: Array<{
    user: {
      _id: string;
      username: string;
    };
    card: string;
    votedAt: string;
  }>;
  result?: {
    average: number;
    median: number;
    min: number;
    max: number;
    consensus: boolean;
  };
  startedAt: string;
  endedAt?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  roomId: string;
  title: string;
  description?: string;
}

export interface VoteRequest {
  card: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(
    private http: HttpClient
  ) {}

  createSession(request: CreateSessionRequest): Observable<Session> {
    return this.http.post<{ message: string; session: Session }>(`${environment.apiUrl}/sessions`, request)
      .pipe(
        map(response => response.session),
        catchError(this.handleError)
      );
  }

  getSessionsByRoom(roomId: string): Observable<Session[]> {
    return this.http.get<{ sessions: Session[] }>(`${environment.apiUrl}/sessions/room/${roomId}`)
      .pipe(
        map(response => response.sessions),
        catchError(this.handleError)
      );
  }

  getSessionById(sessionId: string): Observable<Session> {
    return this.http.get<{ session: Session }>(`${environment.apiUrl}/sessions/${sessionId}`)
      .pipe(
        map(response => response.session),
        catchError(this.handleError)
      );
  }

  submitVote(sessionId: string, request: VoteRequest): Observable<Session> {
    return this.http.post<{ message: string; session: Session }>(`${environment.apiUrl}/sessions/${sessionId}/vote`, request)
      .pipe(
        map(response => response.session),
        catchError(this.handleError)
      );
  }

  startVoting(sessionId: string): Observable<Session> {
    return this.http.post<{ message: string; session: Session }>(`${environment.apiUrl}/sessions/${sessionId}/start`, {})
      .pipe(
        map(response => response.session),
        catchError(this.handleError)
      );
  }

  revealVotes(sessionId: string): Observable<Session> {
    return this.http.post<{ message: string; session: Session }>(`${environment.apiUrl}/sessions/${sessionId}/reveal`, {})
      .pipe(
        map(response => response.session),
        catchError(this.handleError)
      );
  }

  completeSession(sessionId: string): Observable<Session> {
    return this.http.post<{ message: string; session: Session }>(`${environment.apiUrl}/sessions/${sessionId}/complete`, {})
      .pipe(
        map(response => response.session),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Session service error:', error);
    return throwError(() => error.error?.message || 'An error occurred');
  }
} 