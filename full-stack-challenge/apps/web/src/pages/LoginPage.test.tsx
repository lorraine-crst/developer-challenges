import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import { authReducer } from '../store/authSlice';
import LoginPage from './LoginPage';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');

  return {
    ...actual,
    api: { post: vi.fn(), get: vi.fn() },
  };
});

function renderLoginPage() {
  const store = configureStore({ reducer: { auth: authReducer } });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  it('shows validation errors and does not call the API when submitted empty', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows an email error for an invalid email format', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), 'not-an-email');
    await user.type(screen.getByLabelText(/senha/i), 'anything');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument();
  });

  it('calls the API with the entered credentials when the form is valid', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { id: '1', name: 'Teste', email: 'user@dynamox.com' },
      },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/e-mail/i), 'user@dynamox.com');
    await user.type(screen.getByLabelText(/senha/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'user@dynamox.com',
      password: 'secret123',
    });
  });
});