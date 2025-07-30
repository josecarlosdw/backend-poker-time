import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-voting-timer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './voting-timer.component.html',
  styleUrls: ['./voting-timer.component.css']
})
export class VotingTimerComponent implements OnInit, OnDestroy {
  @Input() duration: number = 300; // 5 minutos em segundos
  @Input() isActive: boolean = false;
  @Output() timeUp = new EventEmitter<void>();
  @Output() timerPaused = new EventEmitter<void>();
  @Output() timerResumed = new EventEmitter<void>();

  timeLeft: number = 0;
  isPaused: boolean = false;
  progress: number = 100;
  timerSubscription?: Subscription;

  ngOnInit(): void {
    this.resetTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    if (this.isActive && !this.timerSubscription) {
      this.timerSubscription = interval(1000).subscribe(() => {
        if (!this.isPaused && this.timeLeft > 0) {
          this.timeLeft--;
          this.updateProgress();
          
          if (this.timeLeft === 0) {
            this.timeUp.emit();
            this.stopTimer();
          }
        }
      });
    }
  }

  pauseTimer(): void {
    this.isPaused = true;
    this.timerPaused.emit();
  }

  resumeTimer(): void {
    this.isPaused = false;
    this.timerResumed.emit();
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.timeLeft = this.duration;
    this.isPaused = false;
    this.updateProgress();
  }

  private updateProgress(): void {
    this.progress = (this.timeLeft / this.duration) * 100;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
} 