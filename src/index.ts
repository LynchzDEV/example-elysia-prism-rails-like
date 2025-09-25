import { Elysia } from "elysia";
import { connectDatabase, disconnectDatabase } from './database';
import { postsRoutes } from './routes/posts';
import { usersRoutes } from './routes/users';

const app = new Elysia()
  .onStart(async () => {
    console.log('🚀 Starting Elysia server...');
    const connected = await connectDatabase();
    if (!connected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }
  })

  .onStop(async () => {
    console.log('⏹️  Stopping Elysia server...');
    await disconnectDatabase();
  })

  .get("/", () => {
    console.log('👋 Root endpoint accessed');
    return {
      message: "Welcome to Elysia + Prisma Blog API",
      version: "1.0.0",
      endpoints: {
        posts: "/posts",
        users: "/users",
        health: "/health"
      },
      rails_like_commands: {
        migrate: "bun run db:migrate",
        seed: "bun run db:seed",
        reset: "bun run db:migrate:reset"
      }
    };
  })

  .get("/health", async () => {
    console.log('🏥 Health check requested');
    try {
      // Test database connection
      const result = await fetch('postgresql://admin:password@localhost:5432/elysia_prisma_db')
        .catch(() => null);

      return {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
        error: "Database connection failed"
      };
    }
  })

  .use(usersRoutes)
  .use(postsRoutes)

  .listen(3000);

console.log('');
console.log('🦊 Elysia + Prisma Blog API');
console.log('============================');
console.log(`🌐 Server: http://${app.server?.hostname}:${app.server?.port}`);
console.log('📖 API Documentation:');
console.log('  GET  /              - API info');
console.log('  GET  /health        - Health check');
console.log('  GET  /users         - List all users');
console.log('  POST /users         - Create user');
console.log('  GET  /users/:id     - Get user by ID');
console.log('  GET  /posts         - List all posts');
console.log('  POST /posts         - Create post');
console.log('  GET  /posts/:id     - Get post by ID');
console.log('');
console.log('🛠️  Rails-like Commands:');
console.log('  bun run db:migrate  - Run migrations');
console.log('  bun run db:seed     - Seed database');
console.log('  bun run db:reset    - Reset database');
console.log('============================');
