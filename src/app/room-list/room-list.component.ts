import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from '../services/room.service';
import { AuthService } from '../services/auth.service';
import { Room } from '../room.model';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  loading = false;
  currentUser: any = null;
  
  // Search and filters
  searchTerm = '';
  statusFilter = '';
  sortBy = 'name';
  
  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalRooms = 0;

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.loading = false;
        this.snackBar.open('Erro ao carregar salas', 'Fechar', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.rooms];

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(search) ||
        room.description?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(room => {
        switch (this.statusFilter) {
          case 'active':
            return room.isActive;
          case 'waiting':
            return !room.isActive && room.participants.length > 0;
          case 'completed':
            return room.isCompleted;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'participants':
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        case 'lastActivity':
          return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
        default:
          return 0;
      }
    });

    this.filteredRooms = filtered;
    this.totalRooms = filtered.length;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  createRoom(): void {
    this.router.navigate(['/create-room']);
  }

  enterRoom(room: Room): void {
    this.router.navigate(['/room', room._id]);
  }

  viewRoomDetails(room: Room): void {
    // TODO: Implement room details modal or page
    console.log('View room details:', room);
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  exportRoomData(room: Room): void {
    // TODO: Implement export functionality
    console.log('Export room data:', room);
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  deleteRoom(room: Room): void {
    if (confirm(`Tem certeza que deseja excluir a sala "${room.name}"?`)) {
      this.roomService.deleteRoom(room._id).subscribe({
        next: () => {
          this.loadRooms();
          this.snackBar.open('Sala excluída com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting room:', error);
          this.snackBar.open('Erro ao excluir sala', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTimeAgo(date: Date | string): string {
    if (!date) return 'N/A';
    const now = new Date();
    const d = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  }
}
