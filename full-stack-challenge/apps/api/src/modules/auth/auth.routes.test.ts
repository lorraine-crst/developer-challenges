import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';

const testUser = {
  name: 'Auth Test User',
  email: 'auth.integration@dynamox.com',
  password: 'test-password-123',
};

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.user.create({
    data: {
      name: testUser.name,
      email: testUser.email,
      password: await bcrypt.hash(testUser.password, 10),
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
});

describe('POST /auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf('string');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('returns 401 for a wrong password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
  });

  it('returns 401 for an unknown email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'unknown@dynamox.com', password: testUser.password });

    expect(response.status).toBe(401);
  });

  it('returns 400 for an Formato de e-mail inválido', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'not-an-email', password: testUser.password });

    expect(response.status).toBe(400);
  });
});

describe('GET /auth/me', () => {
  it('returns 401 without a token', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  it('returns the user for a valid token', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(testUser.email);
  });
});