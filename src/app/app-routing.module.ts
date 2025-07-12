import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { CreateRoomComponent } from './create-room/create-room.component';
import { PlanningPokerMainComponent } from './planning-poker-main/planning-poker-main.component'
import { RoomListComponent } from './room-list/room-list.component';

const routes: Routes = [
  {
    path: '',
    component: CreateRoomComponent
  },
  {
    path: 'create',
    component: PlanningPokerMainComponent
  },
  {
    path: 'list',
    component: RoomListComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  

 }
