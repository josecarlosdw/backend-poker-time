import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationOptions {
  duration?: number;
  action?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  show(message: string, options: NotificationOptions = {}): void {
    const config = {
      duration: options.duration || 3000,
      panelClass: this.getPanelClass(options.type)
    };

    this.snackBar.open(message, options.action || 'Fechar', config);
  }

  success(message: string, options: NotificationOptions = {}): void {
    this.show(message, { ...options, type: 'success' });
  }

  error(message: string, options: NotificationOptions = {}): void {
    this.show(message, { ...options, type: 'error', duration: 5000 });
  }

  warning(message: string, options: NotificationOptions = {}): void {
    this.show(message, { ...options, type: 'warning' });
  }

  info(message: string, options: NotificationOptions = {}): void {
    this.show(message, { ...options, type: 'info' });
  }

  private getPanelClass(type?: string): string[] {
    switch (type) {
      case 'success':
        return ['notification-success'];
      case 'error':
        return ['notification-error'];
      case 'warning':
        return ['notification-warning'];
      case 'info':
        return ['notification-info'];
      default:
        return [];
    }
  }

  // Notificações específicas do Planning Poker
  userJoined(username: string): void {
    this.info(`${username} entrou na sala`);
  }

  userLeft(username: string): void {
    this.warning(`${username} saiu da sala`);
  }

  voteReceived(username: string): void {
    this.info(`${username} votou`);
  }

  votesRevealed(): void {
    this.success('Votos revelados!');
  }

  sessionStarted(title: string): void {
    this.success(`Sessão "${title}" iniciada`);
  }

  sessionCompleted(title: string): void {
    this.success(`Sessão "${title}" concluída`);
  }

  timeUp(): void {
    this.warning('Tempo de votação esgotado!');
  }

  // Notificações do navegador (se permitido)
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async sendBrowserNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: options.action,
        icon: '/assets/icon-192x192.png',
        badge: '/assets/icon-192x192.png'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
} 