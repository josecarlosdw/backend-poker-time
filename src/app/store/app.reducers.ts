import { ActionReducerMap } from '@ngrx/store';
import { roomReducer } from './room.reducer';
import { userReducer } from './user.reducer';
import { gameReducer } from './game.reducer';

export interface AppState {
  rooms: any;
  users: any;
  game: any;
}

export const appReducers: ActionReducerMap<AppState> = {
  rooms: roomReducer,
  users: userReducer,
  game: gameReducer
}; 