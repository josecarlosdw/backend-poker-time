import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { Session } from '../../services/session.service';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './session-history.component.html',
  styleUrls: ['./session-history.component.css']
})
export class SessionHistoryComponent implements OnInit {
  @Input() sessions: Session[] = [];
  @Output() viewSession = new EventEmitter<Session>();
  @Output() exportSession = new EventEmitter<Session>();

  displayedColumns: string[] = ['title', 'relatedTask', 'participants', 'result', 'date', 'actions'];
  pageSize = 10;
  pageSizeOptions = [5, 10, 25];
  currentPage = 0;

  ngOnInit(): void {}

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'primary';
      case 'revealed': return 'accent';
      case 'voting': return 'warn';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'revealed': return 'Revelada';
      case 'voting': return 'Votando';
      case 'active': return 'Ativa';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getParticipantCount(session: Session): number {
    return session.votes.length;
  }

  getParticipantNames(session: Session): string {
    if (!session.votes || session.votes.length === 0) return '-';
    const names = session.votes.map(v => v.user?.username).filter(Boolean);
    return Array.from(new Set(names)).join(', ');
  }

  getAverageResult(session: Session): string {
    if (session.result) {
      return session.result.average.toFixed(1);
    }
    return '-';
  }

  onViewSession(session: Session): void {
    this.viewSession.emit(session);
  }

  onExportSession(session: Session): void {
    this.exportSession.emit(session);
  }
} 