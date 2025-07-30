import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';

export interface User {
  username: string;
  selectedCard: string;
  isConnected: boolean;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.addUser, (state, { user }) => ({
    ...state,
    users: [...state.users, user]
  })),
  on(UserActions.removeUser, (state, { username }) => ({
    ...state,
    users: state.users.filter(u => u.username !== username)
  })),
  on(UserActions.setCurrentUser, (state, { user }) => ({
    ...state,
    currentUser: user
  })),
  on(UserActions.updateUserCard, (state, { username, selectedCard }) => ({
    ...state,
    users: state.users.map(user => 
      user.username === username 
        ? { ...user, selectedCard } 
        : user
    )
  }))
); 