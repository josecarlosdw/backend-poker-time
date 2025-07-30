import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';

export interface GameState {
  isGameStarted: boolean;
  isVotingComplete: boolean;
  average: number;
  messages: any[];
  loading: boolean;
  error: string | null;
}

export const initialState: GameState = {
  isGameStarted: false,
  isVotingComplete: false,
  average: 0,
  messages: [],
  loading: false,
  error: null
};

export const gameReducer = createReducer(
  initialState,
  on(GameActions.startGame, (state) => ({
    ...state,
    isGameStarted: true,
    isVotingComplete: false
  })),
  on(GameActions.endGame, (state) => ({
    ...state,
    isGameStarted: false,
    isVotingComplete: false
  })),
  on(GameActions.completeVoting, (state) => ({
    ...state,
    isVotingComplete: true
  })),
  on(GameActions.calculateAverage, (state, { average }) => ({
    ...state,
    average
  })),
  on(GameActions.addMessage, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message]
  })),
  on(GameActions.resetGame, (state) => ({
    ...state,
    isGameStarted: false,
    isVotingComplete: false,
    average: 0,
    messages: []
  }))
); 