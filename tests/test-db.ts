import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NodeModel } from '../src/models/node.model';
import { UserModel } from '../src/models/user.model';
import { seed } from '../src/scripts/seed';
import os from 'os';

let mongo: MongoMemoryServer;


export async function startTestDb() {
  mongo = await MongoMemoryServer.create();
    
  await mongoose.connect(mongo.getUri(), { runtimeAdapters: { os } });
  await UserModel.init();
  await seed();
}

export async function stopTestDb() {
  await mongoose.disconnect();
  await mongo.stop();
}

export async function nodeId(name: string) {
  const node = await NodeModel.findOne({ name });
  return node!._id;
}

export async function authUser(email: string) {
  const user = await UserModel.findOne({ email });
  return { id: user!.id as string, role: user!.role, node: user!.node };
}