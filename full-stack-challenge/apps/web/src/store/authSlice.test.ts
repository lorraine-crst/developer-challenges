import type { LoginResponse, User } from '@dynamox/types';
import { describe, expect, it } from 'vitest';
import { authReducer, login, logout } from './authSlice';

const initialState = {
  user: null,
  status: 'idle' as const,
  error: null,
};

const mockUser: User = {
  id: 'user-1',
  name: 'Avaliador Dynamox',
  email: 'avaliador@dynamox.com',
};

const mockLoginResponse: LoginResponse = {
  token: 'fake-token',
  user: mockUser,
};

describe('authSlice', () => {
  it('sets status to loading on login.pending', () => {
    const action = login.pending('request-1', { email: '', password: '' });
    const state = authReducer(initialState, action);

    expect(state.status).toBe('loading');
  });

  it('sets user and authenticated status on login.fulfilled', () => {
    const action = login.fulfilled(mockLoginResponse, 'request-1', {
      email: mockUser.email,
      password: 'x',
    });
    const state = authReducer(initialState, action);

    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(mockUser);
  });

  it('sets error and unauthenticated status on login.rejected', () => {
    const action = login.rejected(
      new Error('failed'),
      'request-1',
      { email: mockUser.email, password: 'wrong' },
      'E-mail ou senha inválidos',
    );
    const state = authReducer(initialState, action);

    expect(state.status).toBe('unauthenticated');
    expect(state.error).toBe('E-mail ou senha inválidos');
  });

  it('clears user and status on logout.fulfilled', () => {
    const loggedInState = {
      user: mockUser,
      status: 'authenticated' as const,
      error: null,
    };
    const action = logout.fulfilled(undefined, 'request-1', undefined);
    const state = authReducer(loggedInState, action);

    expect(state.user).toBeNull();
    expect(state.status).toBe('unauthenticated');
  });
});