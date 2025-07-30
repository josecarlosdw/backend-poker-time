import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { RoomService, CreateRoomRequest } from '../services/room.service';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent {
  createRoomForm: FormGroup;
  loading = false;
  invitedUsers: { _id: string; username: string; email: string }[] = [];
  userSearchResults$: Observable<{ _id: string; username: string; email: string }[]> = of([]);
  externalTasks: { id: string; title: string; status: string }[] = [];
  filteredTasks: { id: string; title: string; status: string }[] = [];
  selectedTask: { id: string; title: string; status: string } | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createRoomForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      isPrivate: [false],
      relatedTask: [''] // Campo já está opcional, sem Validators.required
    });
  }

  ngOnInit(): void {
    this.roomService.getExternalTasks().subscribe(tasks => {
      this.externalTasks = tasks;
      this.filteredTasks = tasks;
    });
  }

  onUserSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length < 2) {
      this.userSearchResults$ = of([]);
      return;
    }
    this.userSearchResults$ = this.roomService.searchUsers(query).pipe(
      catchError(() => of([]))
    );
  }

  onTaskSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (!query || query.length < 2) {
      this.filteredTasks = this.externalTasks;
      return;
    }
    const q = query.toLowerCase();
    this.filteredTasks = this.externalTasks.filter(task =>
      task.title.toLowerCase().includes(q) || task.id.toLowerCase().includes(q)
    );
  }

  selectTask(task: { id: string; title: string; status: string }): void {
    this.selectedTask = task;
    this.createRoomForm.patchValue({ relatedTask: task.id });
    this.filteredTasks = [];
  }

  addUserToInvite(user: { _id: string; username: string; email: string }): void {
    if (!this.invitedUsers.find(u => u._id === user._id)) {
      this.invitedUsers.push(user);
    }
  }

  removeUserFromInvite(user: { _id: string }): void {
    this.invitedUsers = this.invitedUsers.filter(u => u._id !== user._id);
  }

  onSubmit(): void {
    if (this.createRoomForm.invalid) {
      return;
    }
    this.loading = true;
    const request: CreateRoomRequest = {
      ...this.createRoomForm.value,
      invitedUsers: this.invitedUsers.map(u => u._id)
    };
    this.roomService.createRoom(request).subscribe({
      next: (room) => {
        this.snackBar.open('Sala criada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/room', room._id]);
      },
      error: (err) => {
        this.snackBar.open(err || 'Erro ao criar sala', 'Fechar', { duration: 4000 });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
