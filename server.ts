import path from 'path';
import express from 'express';
import { createApp } from './server/app.ts';
import { connectDB } from './server/config/db.ts';
import { DataStore } from './server/services/dataStore.ts';
import { ENV } from './server/config/env.ts';

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const port = ENV.PORT || 3000;

  // Initialize Database connection and DataStore
  await connectDB();
  await DataStore.init();

  const app = createApp();

  if (isDev) {
    // Mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted for development.');
  } else {
    // Serve production static build
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Production static bundle mounted from dist/');
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Report Management System running at http://0.0.0.0:${port} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
