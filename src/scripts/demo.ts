import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { config } from '../config';
import { seed } from './seed';
import { SEED_PASSWORD } from './seed-data';


async function main() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await seed();

  createApp().listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port} (in-memory database)`);
    console.log(`All users have the password: ${SEED_PASSWORD}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});