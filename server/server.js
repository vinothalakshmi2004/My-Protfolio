/**
 * Entry point: load env -> connect MongoDB -> start HTTP server.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { getJwtSecret } = require('./utils/jwt');

const PORT = Number(process.env.PORT) || 5000;

const start = async ({ port = PORT } = {}) => {
  getJwtSecret(); // fail fast in production when JWT_SECRET is missing
  await connectDB();
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Portfolio API running in ${process.env.NODE_ENV || 'development'} mode on port ${server.address().port}`);
      console.log(`👉 Health check: http://localhost:${server.address().port}/api/health`);
      resolve(server);
    });
  });
};

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err?.message || err}`);
});

if (require.main === module) {
  start().catch((error) => {
    console.error(`✖ Failed to start server: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { app, start };
