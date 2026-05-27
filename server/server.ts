import { app, initializeHosting } from './app';
import { config } from './config/config';
import { testPrismaConnection } from './prisma/client';
import { seedDatabase } from './prisma/seeder';

async function startServer() {
  console.log('🚀 [Server] Initializing full-stack application...');

  // 1. Verify PostgreSQL database connection health
  const isConnected = await testPrismaConnection();
  
  if (isConnected) {
    // 2. Perform database auto-seeding if connection is established
    await seedDatabase();
  } else {
    console.warn('⚠️ [Server] Skipping auto-seeding, database server appears offline.');
  }

  // 3. Setup client hosting (Vite dev or production static client hosting)
  await initializeHosting();

  // 4. Bind server process listener
  const PORT = config.port;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================================`);
    console.log(`📡 EBOOKLET Server running on http://localhost:${PORT}`);
    console.log(`⚙️  Environment: ${config.env}`);
    console.log(`=============================================================`);
  });
}

// Global exception interceptors for absolute crash proofing
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 [Uncaught Exception] thrown:', error);
  // Fail gracefully in production depending on supervisor structures
});

startServer();
