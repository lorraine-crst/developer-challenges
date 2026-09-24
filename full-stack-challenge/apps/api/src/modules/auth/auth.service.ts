import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type { LoginInput } from './auth.schema';

const TOKEN_EXPIRATION = '8h' as const;

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(401, 'auth.invalidCredentials');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, 'auth.invalidCredentials');
  }

  const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export function findUserById(id: string): Promise<AuthenticatedUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}