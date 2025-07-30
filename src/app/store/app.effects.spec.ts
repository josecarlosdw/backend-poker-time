import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { AppEffects } from './app.effects';
import * as UserActions from './user.actions';

describe('AppEffects', () => {
  let actions$: Observable<any>;
  let effects: AppEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(AppEffects);
  });

  it('should dispatch User Added Successfully after addUser', (done) => {
    actions$ = of(UserActions.addUser({ user: { username: 'test', selectedCard: '', isConnected: true } }));
    effects.addUser$.subscribe(action => {
      expect(action.type).toBe('[User] User Added Successfully');
      done();
    });
  });
}); 