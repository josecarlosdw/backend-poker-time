import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { CreateRoomComponent } from './create-room/create-room.component';
import { PlanningPokerMainComponent } from './planning-poker-main/planning-poker-main.component'
import { RoomListComponent } from './room-list/room-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'rooms',
    component: RoomListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
    canActivate: [authGuard]
  },
  {
    path: 'room/:id',
    component: PlanningPokerMainComponent,
    canActivate: [authGuard]
  },
  {
    path: 'sessions',
    loadComponent: () => import('./components/session-history/session-history.component').then(m => m.SessionHistoryComponent),
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  

 }
