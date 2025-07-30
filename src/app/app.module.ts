import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlanningPokerMainComponent } from './planning-poker-main/planning-poker-main.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomListComponent } from './room-list/room-list.component';
import { ChatComponent } from './chat/chat.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RoomService } from './services/room.service';

@NgModule({
  declarations: [
    AppComponent,
    PlanningPokerMainComponent,
    CreateRoomComponent,
    RoomListComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatInputModule
  ],
  providers: [RoomService],
  bootstrap: [AppComponent]
})
export class AppModule {}
