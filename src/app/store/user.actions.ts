import { createAction, props } from '@ngrx/store';
import { User } from './user.reducer';

export const addUser = createAction(
  '[User] Add User',
  props<{ user: User }>()
);

export const removeUser = createAction(
  '[User] Remove User',
  props<{ username: string }>()
);

export const setCurrentUser = createAction(
  '[User] Set Current User',
  props<{ user: User }>()
);

export const updateUserCard = createAction(
  '[User] Update User Card',
  props<{ username: string; selectedCard: string }>()
); 