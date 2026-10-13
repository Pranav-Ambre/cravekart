import app from './app';
import { env } from './config/env';
import prisma from './config/db';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 CraveKart Backend API running on http://localhost:${env.PORT}`);
  console.log(`⚡ Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
