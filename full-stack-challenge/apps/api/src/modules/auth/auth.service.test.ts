import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { login } from './auth.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const findUnique = prisma.user.findUnique as unknown as Mock;

const plainPassword = 'plain-password';
const passwordHash = bcrypt.hashSync(plainPassword, 4);

const storedUser: User = {
  id: 'user-1',
  name: 'Auth Test User',
  email: 'auth.test@dynamox.com',
  password: passwordHash,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  findUnique.mockReset();
});

describe('login', () => {
  it('returns a token and the user without the password hash', async () => {
    findUnique.mockResolvedValue(storedUser);

    const result = await login({ email: storedUser.email, password: plainPassword });

    expect(result.token.split('.')).toHaveLength(3);
    expect(result.user).toEqual({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
    });
    expect(JSON.stringify(result)).not.toContain(passwordHash);
  });

  it('rejects an unknown email with status 401', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      login({ email: 'unknown@dynamox.com', password: plainPassword }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a wrong password with status 401', async () => {
    findUnique.mockResolvedValue(storedUser);

    await expect(
      login({ email: storedUser.email, password: 'wrong-password' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('uses the same message for unknown email and wrong password', async () => {
    findUnique.mockResolvedValue(null);
    const unknownEmail = await login({
      email: 'unknown@dynamox.com',
      password: plainPassword,
    }).catch((error: AppError) => error.message);

    findUnique.mockResolvedValue(storedUser);
    const wrongPassword = await login({
      email: storedUser.email,
      password: 'wrong-password',
    }).catch((error: AppError) => error.message);

    expect(unknownEmail).toBe(wrongPassword);
  });

  it('looks the user up by the email it received', async () => {
    findUnique.mockResolvedValue(storedUser);

    await login({ email: storedUser.email, password: plainPassword });

    expect(findUnique).toHaveBeenCalledWith({ where: { email: storedUser.email } });
  });
});