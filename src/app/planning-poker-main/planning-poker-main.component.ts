
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { RoomService, Room } from '../services/room.service';
import { SessionService, Session } from '../services/session.service';
import { WebSocketService } from '../services/websocket.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ExportService } from '../services/export.service';
import { ChatComponent } from '../chat/chat.component';
import { VotingTimerComponent } from '../components/voting-timer/voting-timer.component';
import { SessionHistoryComponent } from '../components/session-history/session-history.component';

@Component({
  selector: 'app-planning-poker-main',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    ChatComponent,
    VotingTimerComponent,
    SessionHistoryComponent,
    NgChartsModule
  ],
  templateUrl: './planning-poker-main.component.html',
  styleUrls: ['./planning-poker-main.component.css']
})
export class PlanningPokerMainComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  session: Session | null = null;
  sessions: Session[] = [];
  loading = false;
  error: string | null = null;
  currentUser: any = null;
  selectedCard: string = '';
  cards: string[] = ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '∞'];
  isVotingActive = false;
  timerDuration = 300; // 5 minutos
  private subs: Subscription[] = [];
  voteChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  voteChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Distribuição dos Votos' }
    },
    scales: { x: {}, y: { beginAtZero: true } }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private sessionService: SessionService,
    private ws: WebSocketService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private exportService: ExportService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (!roomId) {
      this.router.navigate(['/rooms']);
      return;
    }
    
    this.loading = true;
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    
    this.roomService.getRoomById(roomId).subscribe({
      next: (room) => {
        this.room = room;
        this.loading = false;
        this.setupWebSocket();
        this.loadSessions();
        // Atualizar gráfico ao carregar sessões
        this.updateVoteChart();
      },
      error: (err) => {
        this.notificationService.error(err || 'Erro ao carregar sala');
        this.loading = false;
        this.router.navigate(['/rooms']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.room) {
      this.ws.leaveRoom(this.room._id);
    }
    this.ws.disconnect();
  }

  private setupWebSocket(): void {
    if (!this.room || !this.currentUser) return;

    this.ws.connect();
    this.ws.joinRoom(this.room._id, this.currentUser.username);

    // Subscrever eventos do WebSocket
    this.subs.push(
      this.ws.onUserJoined().subscribe(data => {
        if (data.roomId === this.room?._id) {
          this.notificationService.userJoined(data.username);
        }
      }),

      this.ws.onUserLeft().subscribe(data => {
        if (data.roomId === this.room?._id) {
          this.notificationService.userLeft(data.username);
        }
      }),

      this.ws.onVoteReceived().subscribe(data => {
        this.notificationService.voteReceived(data.username);
      }),

      this.ws.onVotesRevealed().subscribe(() => {
        this.notificationService.votesRevealed();
        this.isVotingActive = false;
        // Também atualizar gráfico ao revelar votos
        setTimeout(() => this.updateVoteChart(), 500);
      })
    );
  }

  private updateVoteChart(): void {
    if (!this.session || !this.session.votes) {
      this.voteChartData = { labels: [], datasets: [] };
      return;
    }
    // Contar votos por valor
    const counts: { [card: string]: number } = {};
    for (const vote of this.session.votes) {
      if (!vote.card) continue;
      counts[vote.card] = (counts[vote.card] || 0) + 1;
    }
    const labels = Object.keys(counts).sort((a, b) => {
      // Ordenar numericamente, mas manter especiais no final
      const numA = parseFloat(a), numB = parseFloat(b);
      if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      return numA - numB;
    });
    this.voteChartData = {
      labels,
      datasets: [
        {
          data: labels.map(l => counts[l]),
          backgroundColor: '#1976d2',
          borderRadius: 6
        }
      ]
    };
  }

  private loadSessions(): void {
    if (!this.room) return;

    this.sessionService.getSessionsByRoom(this.room._id).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.session = sessions.find(s => s.status === 'voting' || s.status === 'active' || s.status === 'revealed') || null;
        this.isVotingActive = this.session?.status === 'voting';
        this.updateVoteChart();
      },
      error: (err) => {
        this.notificationService.error('Erro ao carregar sessões');
      }
    });
  }

  selectCard(card: string): void {
    this.selectedCard = card;
    this.notificationService.info(`Card selecionado: ${card}`);
  }

  isCardSelected(card: string): boolean {
    return this.selectedCard === card;
  }

  sendCard(): void {
    if (!this.selectedCard || !this.room || !this.session) return;
    
    this.ws.sendVote(this.room._id, this.currentUser?.username || '', this.selectedCard);
    this.notificationService.success('Voto enviado!');
  }

  resetCards(): void {
    this.selectedCard = '';
  }

  startVoting(): void {
    if (!this.room) return;

    const title = prompt('Digite o título da sessão:');
    if (!title) return;

    this.sessionService.createSession({
      roomId: this.room._id,
      title: title
    }).subscribe({
      next: (session) => {
        this.session = session;
        this.isVotingActive = true;
        this.notificationService.sessionStarted(session.title);
        this.loadSessions();
      },
      error: (err) => {
        this.notificationService.error('Erro ao iniciar sessão');
      }
    });
  }

  revealVotes(): void {
    if (!this.room || !this.session) return;

    this.ws.revealVotes(this.room._id);
    this.isVotingActive = false;
    setTimeout(() => this.updateVoteChart(), 500);
  }

  onTimeUp(): void {
    this.notificationService.timeUp();
    this.revealVotes();
  }

  onViewSession(session: Session): void {
    // Implementar modal com detalhes da sessão
    this.notificationService.info(`Visualizando sessão: ${session.title}`);
  }

  onExportSession(session: Session): void {
    this.exportService.exportSession(session, {
      format: 'csv',
      includeVotes: true
    });
    this.notificationService.success('Sessão exportada com sucesso!');
  }

  hasVoted(userId: string): boolean {
    if (!this.session) return false;
    return this.session.votes.some(vote => vote.user._id === userId);
  }

  getVoteValue(userId: string): string | null {
    if (!this.session || this.session.status !== 'revealed') return null;
    const vote = this.session.votes.find(vote => vote.user._id === userId);
    return vote ? vote.card : null;
  }

  confirmEstimate(): void {
    if (!this.session) return;
    this.sessionService.completeSession(this.session._id).subscribe({
      next: () => {
        this.notificationService.success('Estimativa confirmada e sessão finalizada!');
        this.loadSessions();
      },
      error: () => {
        this.notificationService.error('Erro ao finalizar sessão');
      }
    });
  }
}