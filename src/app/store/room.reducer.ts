import { createReducer, on } from '@ngrx/store';
import { Room } from '../room.model';
import * as RoomActions from './room.actions';

export interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
}

export const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null
};

export const roomReducer = createReducer(
  initialState,
  on(RoomActions.loadRooms, (state) => ({
    ...state,
    loading: true
  })),
  on(RoomActions.loadRoomsSuccess, (state, { rooms }) => ({
    ...state,
    rooms,
    loading: false
  })),
  on(RoomActions.loadRoomsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(RoomActions.createRoom, (state, { room }) => ({
    ...state,
    rooms: [...state.rooms, room]
  })),
  on(RoomActions.setCurrentRoom, (state, { room }) => ({
    ...state,
    currentRoom: room
  }))
); 