import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/rooms', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'rooms', 
    loadComponent: () => import('./room-list/room-list.component').then(m => m.RoomListComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'create-room', 
    loadComponent: () => import('./create-room/create-room.component').then(m => m.CreateRoomComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'room/:id', 
    loadComponent: () => import('./planning-poker-main/planning-poker-main.component').then(m => m.PlanningPokerMainComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/rooms' }
]; 