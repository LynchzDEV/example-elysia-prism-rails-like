# Elysia + Prisma Blog API

A modern, production-ready REST API built with Elysia framework and Prisma ORM, featuring Rails-like CLI commands and clean architecture patterns.

## ✨ Features

- **🦊 Elysia Framework** - Fast and modern TypeScript web framework
- **🗄️ Prisma ORM** - Type-safe database access with PostgreSQL
- **🚂 Rails-like Commands** - Familiar `db:migrate`, `db:seed`, `db:reset` CLI commands
- **🏗️ Clean Architecture** - Service layer pattern with proper separation of concerns
- **📝 Professional Logging** - Structured logging with colors, timestamps, and context
- **🔒 Type Safety** - Full TypeScript implementation with strict typing
- **🐳 Docker Support** - Containerized PostgreSQL database setup
- **📊 Comprehensive API** - Complete CRUD operations for users and posts
- **🎯 Production Ready** - Error handling, validation, and health checks

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Validation**: Elysia built-in validation
- **Containerization**: Docker Compose

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- [Bun](https://bun.sh/) (latest version)
- [Docker](https://www.docker.com/) and Docker Compose
- [Git](https://git-scm.com/)
- A code editor (VS Code recommended)

## 🚀 Quick Start

### 1. Create New Project

```bash
# Create new project directory
mkdir elysia-prisma-blog
cd elysia-prisma-blog

# Initialize with Bun
bun init -y

# Install core dependencies
bun add elysia @prisma/client prisma zod
bun add -d @types/bun typescript
```

### 2. Setup Database with Docker

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: elysia_prisma_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: elysia_prisma_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Start the database:

```bash
docker-compose up -d
```

### 3. Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/elysia_prisma_db"

# Application
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="info"
```

### 4. Initialize Prisma

```bash
# Initialize Prisma
bunx prisma init

# Create your schema in prisma/schema.prisma
# Then run initial migration
bunx prisma migrate dev --name init

# Generate Prisma client
bunx prisma generate
```

## 📁 Project Structure

After following the setup, your project should look like this:

```
elysia-prisma/
├── src/
│   ├── config/
│   │   ├── app.ts              # App configuration with Zod validation
│   │   └── database.ts         # Database configuration
│   ├── lib/
│   │   └── database.ts         # Database singleton manager
│   ├── utils/
│   │   └── logger.ts           # Professional logging system
│   ├── services/
│   │   ├── base.service.ts     # Base service class
│   │   ├── user.service.ts     # User business logic
│   │   └── post.service.ts     # Post business logic
│   ├── controllers/
│   │   ├── user.controller.ts  # User API routes
│   │   └── post.controller.ts  # Post API routes
│   ├── cli/
│   │   ├── base.command.ts     # Base command class
│   │   └── commands/
│   │       ├── migrate.command.ts  # Migration commands
│   │       └── seed.command.ts     # Database seeding
│   ├── app.ts                  # Elysia app setup
│   └── server.ts               # Server entry point
├── cli/
│   ├── migrate.ts              # Migration CLI entry
│   └── seed.ts                 # Seeding CLI entry
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── docker-compose.yml          # Database container
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🗄️ Database Schema

The project includes a complete blog schema with:

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  first_name  String?
  last_name   String?
  bio         String?
  avatar_url  String?
  is_admin    Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  posts    Post[]
  comments Comment[]

  @@map("users")
}

model Post {
  id           String     @id @default(cuid())
  title        String
  slug         String     @unique
  content      String?
  excerpt      String?
  status       PostStatus @default(DRAFT)
  view_count   Int        @default(0)
  like_count   Int        @default(0)
  published_at DateTime?
  created_at   DateTime   @default(now())
  updated_at   DateTime   @updatedAt
  author_id    String

  author    User        @relation(fields: [author_id], references: [id], onDelete: Cascade)
  comments  Comment[]
  post_tags PostTag[]

  @@map("posts")
}

model Comment {
  id         String   @id @default(cuid())
  content    String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  author_id  String
  post_id    String
  parent_id  String?

  author  User      @relation(fields: [author_id], references: [id], onDelete: Cascade)
  post    Post      @relation(fields: [post_id], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parent_id], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@map("comments")
}

model Tag {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  post_tags PostTag[]

  @@map("tags")
}

model PostTag {
  id      String @id @default(cuid())
  post_id String
  tag_id  String

  post Post @relation(fields: [post_id], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([post_id, tag_id])
  @@map("post_tags")
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## 🔧 Rails-like CLI Commands

The project includes familiar Rails-style database commands:

### Migration Commands

```bash
# Run pending migrations
bun run db:migrate

# Reset database (drop, create, migrate)
bun run db:reset

# Check migration status
bunx prisma migrate status
```

### Seeding Commands

```bash
# Seed database with sample data
bun run db:seed

# This will create:
# - 3 sample users (including admin)
# - 5 content tags
# - 4 blog posts (mix of published and draft)
# - 3 comments with relationships
# - Post-tag associations
```

### Database Utilities

```bash
# View database in Prisma Studio
bunx prisma studio

# Reset and regenerate Prisma client
bunx prisma generate

# Apply schema changes without migration
bunx prisma db push
```

## 📡 API Endpoints

The API provides comprehensive CRUD operations:

### Health & Info
```
GET  /           # API information and available endpoints
GET  /health     # Database health check
```

### Users
```
GET  /users      # List all users with stats
GET  /users/:id  # Get user by ID with posts
POST /users      # Create new user
```

### Posts
```
GET  /posts      # List all posts with authors
GET  /posts/:id  # Get post with comments (increments view count)
POST /posts      # Create new post
```

## 🏃 Development Workflow

### 1. Start Development Server

```bash
# Start with hot reload
bun run dev

# Or start normally
bun run start
```

### 2. Database Operations

```bash
# Reset and seed database
bun run db:reset
bun run db:seed

# Check database with Studio
bunx prisma studio
```

### 3. API Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/users

# Get all posts
curl http://localhost:3000/posts

# Create new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## 🏗️ Architecture Patterns

### Service Layer Pattern
- **Base Service**: Common logging and utilities
- **User Service**: User-specific business logic
- **Post Service**: Post-specific business logic with relationships

### Clean Architecture
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and data operations
- **Config**: Environment and application configuration
- **Utils**: Shared utilities like logging

### Database Management
- **Singleton Pattern**: Single database connection instance
- **Connection Pooling**: Efficient database connections
- **Health Checks**: Monitor database connectivity

### Professional Logging
- **Structured Logging**: Timestamps, levels, and context
- **Color Coding**: Different colors for different log levels
- **Operation Tracking**: Service-level operation logging

## 🔧 Configuration

The application uses Zod for configuration validation:

```typescript
// src/config/app.ts
export const appConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  DATABASE_URL: process.env.DATABASE_URL
};
```

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Build and Start

```bash
# Build TypeScript
bun run build

# Run migrations
bun run db:migrate

# Start production server
bun run start
```

### Docker Deployment (Optional)

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

## 🧪 Example API Responses

### Get Posts Response
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "title": "Getting Started with Elysia",
      "slug": "getting-started-elysia",
      "excerpt": "Learn how to build modern APIs...",
      "status": "PUBLISHED",
      "view_count": 245,
      "like_count": 18,
      "author": {
        "id": "clyyy",
        "username": "john_doe",
        "first_name": "John",
        "last_name": "Doe"
      },
      "_count": {
        "comments": 3
      }
    }
  ],
  "count": 4
}
```

### Get Single Post Response
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "title": "Getting Started with Elysia",
    "content": "# Getting Started...",
    "author": {
      "id": "clyyy",
      "username": "john_doe",
      "bio": "Software developer..."
    },
    "comments": [
      {
        "id": "clzzz",
        "content": "Great article!",
        "author": {
          "username": "jane_smith"
        }
      }
    ]
  }
}
```

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "dev": "bun run --watch src/server.ts",
    "start": "bun run src/server.ts",
    "db:migrate": "bun run cli/migrate.ts",
    "db:seed": "bun run cli/seed.ts",
    "db:reset": "bunx prisma migrate reset --force && bun run db:seed"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the established patterns
4. Test thoroughly with the provided CLI commands
5. Commit with descriptive messages
6. Push and create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Resources

- [Elysia Documentation](https://elysiajs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Built with ❤️ using Elysia, Prisma, and modern TypeScript patterns**