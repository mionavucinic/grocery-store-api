import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { NodeModel } from '../models/node.model';
import { UserModel } from '../models/user.model';
import { SeedNode, tree, users, SEED_PASSWORD } from './seed-data';


async function insertTree(
  node: SeedNode,
  ancestors: Types.ObjectId[] = [],
  ids = new Map<string, Types.ObjectId>(),
) {
  const parent = ancestors.length ? ancestors[ancestors.length - 1] : null;
  const created = await NodeModel.create({ name: node.name, type: node.type, parent, ancestors });
  ids.set(node.name, created._id);

  for (const child of node.children ?? []) {
    await insertTree(child, [...ancestors, created._id], ids);
  }
  return ids;
}

export async function seed() {
  await NodeModel.deleteMany({});
  await UserModel.deleteMany({});

  const nodeIds = await insertTree(tree);
  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  await UserModel.insertMany(
    users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      password,
      node: nodeIds.get(u.nodeName),
    })),
  );

  return { nodes: nodeIds.size, users: users.length };
}


if (require.main === module) {
  mongoose
    .connect(config.mongoUri)
    .then(seed)
    .then(({ nodes, users }) => {
      console.log(`Seeded ${nodes} nodes and ${users} users (password for all: ${SEED_PASSWORD})`);
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}