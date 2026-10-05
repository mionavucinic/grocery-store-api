import {
  canManage,
  canView,
  getSubtreeNodeIds,
  isInSubtree,
  visibleRoles,
} from '../src/services/access.service';
import { authUser, nodeId, startTestDb, stopTestDb } from './test-db';
beforeAll(startTestDb, 120_000);
afterAll(stopTestDb);

describe('visibleRoles', () => {
  it('lets managers see employees and managers', async () => {
    const manager = await authUser('manager.novibeograd@grocery.rs');
    expect(visibleRoles(manager)).toEqual(['employee', 'manager']);
  });

  it('lets employees see only employees', async () => {
    const employee = await authUser('employee.bezanija@grocery.rs');
    expect(visibleRoles(employee)).toEqual(['employee']);
  });
});

describe('isInSubtree', () => {
  it('treats a node as part of its own subtree', async () => {
    const noviBeograd = await nodeId('Novi Beograd');
    expect(await isInSubtree(noviBeograd, noviBeograd)).toBe(true);
  });

  it('finds a descendant several levels down', async () => {
    expect(await isInSubtree(await nodeId('Radnja 6'), await nodeId('Novi Beograd'))).toBe(true);
  });

  it('rejects a node from another branch', async () => {
    expect(await isInSubtree(await nodeId('Radnja 1'), await nodeId('Novi Beograd'))).toBe(false);
  });

  it('rejects a parent node', async () => {
    expect(await isInSubtree(await nodeId('Grad Beograd'), await nodeId('Novi Beograd'))).toBe(false);
  });
});

describe('getSubtreeNodeIds', () => {
  it('returns the node and all its descendants', async () => {
    const ids = await getSubtreeNodeIds(await nodeId('Novi Beograd'));
    const expected = [await nodeId('Novi Beograd'), await nodeId('Bezanija'), await nodeId('Radnja 6')];
    expect(ids.map(String).sort()).toEqual(expected.map(String).sort());
  });

  it('returns only the node itself for a store', async () => {
    const ids = await getSubtreeNodeIds(await nodeId('Radnja 6'));
    expect(ids.map(String)).toEqual([String(await nodeId('Radnja 6'))]);
  });
});

describe('canView', () => {
  it('lets a manager see a manager below them', async () => {
    const manager = await authUser('manager.novibeograd@grocery.rs');
    expect(await canView(manager, { role: 'manager', node: await nodeId('Radnja 6') })).toBe(true);
  });

  it('does not let a manager see users from another branch', async () => {
    const manager = await authUser('manager.novibeograd@grocery.rs');
    expect(await canView(manager, { role: 'employee', node: await nodeId('Radnja 1') })).toBe(false);
  });

  it('lets an employee see an employee below them', async () => {
    const employee = await authUser('employee.bezanija@grocery.rs');
    expect(await canView(employee, { role: 'employee', node: await nodeId('Radnja 6') })).toBe(true);
  });

  it('does not let an employee see a manager, even below them', async () => {
    const employee = await authUser('employee.bezanija@grocery.rs');
    expect(await canView(employee, { role: 'manager', node: await nodeId('Radnja 6') })).toBe(false);
  });
});

describe('canManage', () => {
  it('lets a manager manage their own node and below', async () => {
    const manager = await authUser('manager.novibeograd@grocery.rs');
    expect(await canManage(manager, await nodeId('Novi Beograd'))).toBe(true);
    expect(await canManage(manager, await nodeId('Radnja 6'))).toBe(true);
  });

  it('does not let a manager manage a parent node', async () => {
    const manager = await authUser('manager.novibeograd@grocery.rs');
    expect(await canManage(manager, await nodeId('Grad Beograd'))).toBe(false);
  });

  it('never lets an employee manage anyone', async () => {
    const employee = await authUser('employee.bezanija@grocery.rs');
    expect(await canManage(employee, await nodeId('Radnja 6'))).toBe(false);
  });
});