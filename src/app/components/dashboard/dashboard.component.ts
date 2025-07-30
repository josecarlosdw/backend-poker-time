import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

interface DashboardStats {
  totalRooms: number;
  activeSessions: number;
  totalParticipants: number;
  completedVotes: number;
  averageVoteTime: number;
}

interface RecentActivity {
  id: string;
  type: 'room_created' | 'vote_completed' | 'user_joined' | 'session_started';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalRooms: 12,
    activeSessions: 3,
    totalParticipants: 45,
    completedVotes: 28,
    averageVoteTime: 4.2
  };

  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'room_created',
      title: 'Sprint Planning Q4',
      description: 'Nova sala criada por João Silva',
      timestamp: new Date(),
      icon: 'add_circle',
      color: '#36b37e'
    },
    {
      id: '2',
      type: 'vote_completed',
      title: 'Backend API Tasks',
      description: 'Votação finalizada - Média: 8 pontos',
      timestamp: new Date(Date.now() - 1800000),
      icon: 'check_circle',
      color: '#0052cc'
    },
    {
      id: '3',
      type: 'user_joined',
      title: 'Frontend Components',
      description: 'Maria Santos entrou na sala',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'person_add',
      color: '#ff8b00'
    },
    {
      id: '4',
      type: 'session_started',
      title: 'Database Optimization',
      description: 'Sessão iniciada por Pedro Costa',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'play_circle',
      color: '#6554c0'
    }
  ];

  quickActions: QuickAction[] = [
    {
      title: 'Criar Nova Sala',
      description: 'Iniciar uma nova sessão de Planning Poker',
      icon: 'add_circle',
      color: '#36b37e',
      route: '/create-room'
    },
    {
      title: 'Entrar em Sala',
      description: 'Participar de uma sessão existente',
      icon: 'meeting_room',
      color: '#0052cc',
      route: '/rooms'
    },
    {
      title: 'Ver Histórico',
      description: 'Consultar sessões anteriores',
      icon: 'history',
      color: '#ff8b00',
      route: '/sessions'
    },
    {
      title: 'Analytics',
      description: 'Visualizar estatísticas e relatórios',
      icon: 'analytics',
      color: '#6554c0',
      route: '/analytics'
    }
  ];

  displayedColumns: string[] = ['room', 'participants', 'status', 'lastActivity', 'actions'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load real data from services
    console.log('Loading dashboard data...');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getActivityIcon(activity: RecentActivity): string {
    return activity.icon;
  }

  getActivityColor(activity: RecentActivity): string {
    return activity.color;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#36b37e';
      case 'waiting': return '#ff8b00';
      case 'completed': return '#0052cc';
      default: return '#6b778c';
    }
  }
} 