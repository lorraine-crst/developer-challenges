import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../lib/i18n/LanguageContext';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('shows the title and message when open', () => {
    render(
      <LanguageProvider>
        <ConfirmDialog
          open
          title="Excluir máquina"
          message="Tem certeza?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText('Excluir máquina')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();

    render(
      <LanguageProvider>
        <ConfirmDialog
          open
          title="Excluir máquina"
          message="Tem certeza?"
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();

    render(
      <LanguageProvider>
        <ConfirmDialog
          open
          title="Excluir máquina"
          message="Tem certeza?"
          onConfirm={onConfirm}
          onCancel={vi.fn()}
        />
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByText('Excluir'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons when loading', () => {
    render(
      <LanguageProvider>
        <ConfirmDialog
          open
          title="Excluir máquina"
          message="Tem certeza?"
          loading
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText('Cancelar')).toBeDisabled();
    expect(screen.getByText('Excluindo...')).toBeDisabled();
  });
});