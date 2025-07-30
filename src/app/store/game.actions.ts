import { createAction, props } from '@ngrx/store';

export const startGame = createAction('[Game] Start Game');

export const endGame = createAction('[Game] End Game');

export const completeVoting = createAction('[Game] Complete Voting');

export const calculateAverage = createAction(
  '[Game] Calculate Average',
  props<{ average: number }>()
);

export const addMessage = createAction(
  '[Game] Add Message',
  props<{ message: any }>()
);

export const resetGame = createAction('[Game] Reset Game'); 