import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';
import { SEED_PASSWORD } from '../src/scripts/seed-data';
import { nodeId, startTestDb, stopTestDb } from './test-db';

const app = createApp();

beforeAll(startTestDb, 120_000);
afterAll(stopTestDb);

async function tokenFor(email: string) {
  const res = await request(app).post('/auth/login').send({ email, password: SEED_PASSWORD });
  return res.body.token as string;
}

function names(body: { name: string }[]) {
  return body.map((u) => u.name);
}

describe('authentication', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'manager.novibeograd@grocery.rs', password: SEED_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'manager.novibeograd@grocery.rs', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get(`/nodes/${await nodeId('Novi Beograd')}/employees`);
    expect(res.status).toBe(401);
  });
});

describe('node queries', () => {
  it('returns employees of one node only', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const res = await request(app)
      .get(`/nodes/${await nodeId('Novi Beograd')}/employees`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(names(res.body)).toEqual(['Jovana Jovic']);
  });

  it('returns employees of a node and its descendants', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const res = await request(app)
      .get(`/nodes/${await nodeId('Novi Beograd')}/employees?descendants=true`)
      .set('Authorization', `Bearer ${token}`);
    expect(names(res.body)).toEqual(['Jovana Jovic', 'Luka Lukic', 'Petar Petrovic']);
  });

  it('returns managers of a node and its descendants', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const res = await request(app)
      .get(`/nodes/${await nodeId('Novi Beograd')}/managers?descendants=true`)
      .set('Authorization', `Bearer ${token}`);
    expect(names(res.body)).toEqual(['Mina Minic', 'Stefan Stefanovic']);
  });

  it('never returns password hashes', async () => {
    const token = await tokenFor('manager.srbija@grocery.rs');
    const res = await request(app)
      .get(`/nodes/${await nodeId('Srbija')}/employees?descendants=true`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((u: object) => !('password' in u))).toBe(true);
  });

  it('forbids employees from listing managers', async () => {
    const token = await tokenFor('employee.bezanija@grocery.rs');
    const res = await request(app)
      .get(`/nodes/${await nodeId('Bezanija')}/managers`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('forbids querying a node outside your subtree', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const res = await request(app)
      .get(`/nodes/${await nodeId('Novi Sad')}/employees`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('user CRUD', () => {
  it('lets a manager create, update and delete a user in their subtree', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app)
      .post('/users')
      .set(auth)
      .send({
        name: 'Test User',
        email: 'test.user@grocery.rs',
        password: 'secret123',
        role: 'employee',
        node: String(await nodeId('Radnja 6')),
      });
    expect(created.status).toBe(201);
    expect(created.body.password).toBeUndefined();

    const updated = await request(app)
      .patch(`/users/${created.body._id}`)
      .set(auth)
      .send({ name: 'Renamed User' });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Renamed User');

    const deleted = await request(app).delete(`/users/${created.body._id}`).set(auth);
    expect(deleted.status).toBe(204);
  });

  it('forbids creating a user outside the manager subtree', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Outsider',
        email: 'outsider@grocery.rs',
        password: 'secret123',
        role: 'employee',
        node: String(await nodeId('Radnja 1')),
      });
    expect(res.status).toBe(403);
  });

  it('forbids moving a user out of the manager subtree', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const target = await request(app)
      .get(`/nodes/${await nodeId('Radnja 6')}/employees`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .patch(`/users/${target.body[0]._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ node: String(await nodeId('Radnja 1')) });
    expect(res.status).toBe(403);
  });

  it('forbids employees from deleting anyone', async () => {
    const managerToken = await tokenFor('manager.novibeograd@grocery.rs');
    const target = await request(app)
      .get(`/nodes/${await nodeId('Radnja 6')}/employees`)
      .set('Authorization', `Bearer ${managerToken}`);

    const employeeToken = await tokenFor('employee.bezanija@grocery.rs');
    const res = await request(app)
      .delete(`/users/${target.body[0]._id}`)
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(403);
  });

  it('rejects a duplicate email', async () => {
    const token = await tokenFor('manager.novibeograd@grocery.rs');
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Duplicate',
        email: 'employee.radnja6@grocery.rs',
        password: 'secret123',
        role: 'employee',
        node: String(await nodeId('Radnja 6')),
      });
    expect(res.status).toBe(409);
  });
});