import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Notification {
  id: number;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTooltipModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DoNote';
  isAuthenticated = false;
  currentUser: any = null;
  sidebarExpanded = true;
  searchTerm = '';
  notifications: Notification[] = [];
  notificationCount = 0;
  darkMode = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
    
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );

    // Mock notifications
    this.notifications = [
      {
        id: 1,
        message: 'Nova sala criada: Sprint Planning',
        icon: 'meeting_room',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        message: 'Votação finalizada na sala Backend Tasks',
        icon: 'check_circle',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: 3,
        message: 'Novo participante na sala Frontend',
        icon: 'person_add',
        timestamp: new Date(Date.now() - 7200000),
        read: true
      }
    ];

    this.notificationCount = this.notifications.filter(n => !n.read).length;
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyDarkMode();
  }

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    // Implement search functionality
    console.log('Searching for:', this.searchTerm);
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode ? 'true' : 'false');
    this.applyDarkMode();
  }

  applyDarkMode(): void {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
