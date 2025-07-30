import { userReducer, initialState, UserState } from './user.reducer';
import * as UserActions from './user.actions';

describe('UserReducer', () => {
  it('should add a user', () => {
    const user = { username: 'test', selectedCard: '', isConnected: true };
    const state: UserState = userReducer(initialState, UserActions.addUser({ user }));
    expect(state.users.length).toBe(1);
    expect(state.users[0].username).toBe('test');
  });

  it('should remove a user', () => {
    const user = { username: 'test', selectedCard: '', isConnected: true };
    const stateWithUser: UserState = userReducer(initialState, UserActions.addUser({ user }));
    const state: UserState = userReducer(stateWithUser, UserActions.removeUser({ username: 'test' }));
    expect(state.users.length).toBe(0);
  });
}); 