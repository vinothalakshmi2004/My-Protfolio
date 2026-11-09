/**
 * npm run dev:memory
 *
 * Starts the API against a throw-away in-memory MongoDB, pre-seeded with the
 * portfolio data. Perfect for trying the admin dashboard (uploads, deletes,
 * reordering...) without touching your real database. Data is lost on exit.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('portfolio_dev');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[dev:memory] In-memory MongoDB ready at ${process.env.MONGO_URI}`);

  const { seedDatabase } = require('../seed/seeder');
  await seedDatabase();

  const { start } = require('../server');
  await start();

  const shutdown = async () => {
    await mongoose.disconnect();
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((error) => {
  console.error(`✖ dev:memory failed: ${error.message}`);
  process.exit(1);
});
