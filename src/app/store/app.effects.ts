import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as UserActions from './user.actions';
import * as GameActions from './game.actions';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private store: Store
  ) {}

  // Effects para usuários
  addUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.addUser),
    map(({ user }) => {
      // Aqui você pode adicionar lógica adicional, como salvar no backend
      return { type: '[User] User Added Successfully' };
    })
  ));

  // Effects para jogo
  calculateAverage$ = createEffect(() => this.actions$.pipe(
    ofType(GameActions.completeVoting),
    map(() => {
      // Lógica para calcular média
      return GameActions.calculateAverage({ average: 0 });
    })
  ));
} 