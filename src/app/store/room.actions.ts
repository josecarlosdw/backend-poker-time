import { createAction, props } from '@ngrx/store';
import { Room } from '../room.model';

export const loadRooms = createAction('[Room] Load Rooms');

export const loadRoomsSuccess = createAction(
  '[Room] Load Rooms Success',
  props<{ rooms: Room[] }>()
);

export const loadRoomsFailure = createAction(
  '[Room] Load Rooms Failure',
  props<{ error: string }>()
);

export const createRoom = createAction(
  '[Room] Create Room',
  props<{ room: Room }>()
);

export const setCurrentRoom = createAction(
  '[Room] Set Current Room',
  props<{ room: Room }>()
); 