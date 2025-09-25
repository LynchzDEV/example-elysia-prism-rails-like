#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const COLORS = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color?: keyof typeof COLORS) {
  const colorCode = color ? COLORS[color] : '';
  const resetCode = color ? COLORS.reset : '';
  console.log(`${colorCode}${message}${resetCode}`);
}

const prisma = new PrismaClient();

async function createUsers() {
  log('📝 Creating users...', 'blue');

  const users = [
    {
      email: 'john@example.com',
      username: 'john_doe',
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Software developer and tech enthusiast.',
      is_admin: true
    },
    {
      email: 'jane@example.com',
      username: 'jane_smith',
      first_name: 'Jane',
      last_name: 'Smith',
      bio: 'Frontend developer who loves React and TypeScript.',
      is_admin: false
    },
    {
      email: 'bob@example.com',
      username: 'bob_wilson',
      first_name: 'Bob',
      last_name: 'Wilson',
      bio: 'Backend engineer specializing in Node.js and databases.',
      is_admin: false
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
    log(`  ✓ Created user: ${user.username} (${user.email})`, 'green');
  }

  return createdUsers;
}

async function createTags() {
  log('🏷️  Creating tags...', 'blue');

  const tags = [
    { name: 'Technology', slug: 'technology', description: 'Posts about technology and programming', color: '#3B82F6' },
    { name: 'Tutorial', slug: 'tutorial', description: 'Step-by-step guides and tutorials', color: '#10B981' },
    { name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming language', color: '#F59E0B' },
    { name: 'React', slug: 'react', description: 'React.js library and ecosystem', color: '#06B6D4' },
    { name: 'Node.js', slug: 'nodejs', description: 'Node.js runtime and backend development', color: '#84CC16' }
  ];

  const createdTags = [];
  for (const tagData of tags) {
    const tag = await prisma.tag.create({ data: tagData });
    createdTags.push(tag);
    log(`  ✓ Created tag: ${tag.name}`, 'green');
  }

  return createdTags;
}

async function createPosts(users: any[], tags: any[]) {
  log('📄 Creating posts...', 'blue');

  const posts = [
    {
      title: 'Getting Started with Elysia and Prisma',
      slug: 'getting-started-elysia-prisma',
      content: `# Getting Started with Elysia and Prisma

Elysia is a fast and modern TypeScript framework built on Bun. When combined with Prisma, it creates a powerful stack for building web applications.

## Why Choose Elysia?

1. **Performance**: Built on Bun runtime for maximum speed
2. **Type Safety**: Full TypeScript support out of the box
3. **Developer Experience**: Clean and intuitive API design
4. **Modern**: Uses the latest JavaScript features

## Setting Up Your Project

First, create a new Elysia project and install Prisma...`,
      excerpt: 'Learn how to set up a modern web application using Elysia framework and Prisma ORM.',
      status: 'PUBLISHED',
      published_at: new Date('2024-01-15'),
      author_id: users[0].id,
      view_count: 245,
      like_count: 18
    },
    {
      title: 'Advanced TypeScript Patterns for Backend Development',
      slug: 'advanced-typescript-backend-patterns',
      content: `# Advanced TypeScript Patterns for Backend Development

TypeScript has evolved significantly, and with it, the patterns we use for backend development have become more sophisticated...

## Generic Utilities

\`\`\`typescript
type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};
\`\`\`

This pattern allows us to create consistent API responses across our application.`,
      excerpt: 'Explore advanced TypeScript patterns that make backend development more robust and maintainable.',
      status: 'PUBLISHED',
      published_at: new Date('2024-01-20'),
      author_id: users[1].id,
      view_count: 189,
      like_count: 23
    },
    {
      title: 'Building Scalable APIs with Modern Tools',
      slug: 'building-scalable-apis-modern-tools',
      content: `# Building Scalable APIs with Modern Tools

Creating scalable APIs requires the right combination of tools, patterns, and architectural decisions...`,
      excerpt: 'A comprehensive guide to building APIs that scale with your business needs.',
      status: 'PUBLISHED',
      published_at: new Date('2024-01-25'),
      author_id: users[2].id,
      view_count: 156,
      like_count: 12
    },
    {
      title: 'Database Migrations: A Rails-inspired Approach',
      slug: 'database-migrations-rails-inspired',
      content: `# Database Migrations: A Rails-inspired Approach

One of the best features of Ruby on Rails is its migration system. Let's explore how we can bring similar concepts to our Node.js applications...`,
      excerpt: 'Learn how to implement Rails-like database migrations in your Node.js projects.',
      status: 'DRAFT',
      author_id: users[0].id,
      view_count: 0,
      like_count: 0
    }
  ];

  const createdPosts = [];
  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });
    createdPosts.push(post);
    log(`  ✓ Created post: ${post.title} (${post.status})`, 'green');
  }

  return createdPosts;
}

async function createPostTags(posts: any[], tags: any[]) {
  log('🔗 Linking posts to tags...', 'blue');

  const postTagRelations = [
    { postIndex: 0, tagIndexes: [0, 1] }, // Elysia post -> Technology, Tutorial
    { postIndex: 1, tagIndexes: [0, 2] }, // TypeScript post -> Technology, JavaScript
    { postIndex: 2, tagIndexes: [0, 4] }, // Scalable APIs -> Technology, Node.js
    { postIndex: 3, tagIndexes: [0, 1] }  // Migrations -> Technology, Tutorial
  ];

  for (const relation of postTagRelations) {
    for (const tagIndex of relation.tagIndexes) {
      await prisma.postTag.create({
        data: {
          post_id: posts[relation.postIndex].id,
          tag_id: tags[tagIndex].id
        }
      });
      log(`  ✓ Linked "${posts[relation.postIndex].title}" to "${tags[tagIndex].name}"`, 'green');
    }
  }
}

async function createComments(users: any[], posts: any[]) {
  log('💬 Creating comments...', 'blue');

  const comments = [
    {
      content: 'Great introduction! This helped me get started quickly with Elysia.',
      author_id: users[1].id,
      post_id: posts[0].id
    },
    {
      content: 'Thanks for sharing this. The Prisma setup was exactly what I needed.',
      author_id: users[2].id,
      post_id: posts[0].id
    },
    {
      content: 'These TypeScript patterns are really useful. I\'ll definitely be using the ApiResponse type in my projects.',
      author_id: users[0].id,
      post_id: posts[1].id
    },
    {
      content: 'Could you add more examples of generic utilities?',
      author_id: users[2].id,
      post_id: posts[1].id
    }
  ];

  const createdComments = [];
  for (const commentData of comments) {
    const comment = await prisma.comment.create({ data: commentData });
    createdComments.push(comment);
    log(`  ✓ Created comment on post: ${posts.find(p => p.id === comment.post_id)?.title}`, 'green');
  }

  // Create some nested replies
  await prisma.comment.create({
    data: {
      content: 'I\'ll consider adding more examples in a follow-up post. Thanks for the suggestion!',
      author_id: users[1].id,
      post_id: posts[1].id,
      parent_id: createdComments[3].id
    }
  });
  log(`  ✓ Created nested reply comment`, 'green');

  return createdComments;
}

async function main() {
  try {
    log(`${COLORS.bold}${COLORS.blue}🌱 Rails-like Database Seeding Tool${COLORS.reset}`);
    log('====================================\n');

    log('🧹 Clearing existing data...', 'yellow');
    await prisma.postTag.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
    log('  ✓ Existing data cleared', 'green');

    log('\n🚀 Starting seed process...\n', 'blue');

    const users = await createUsers();
    const tags = await createTags();
    const posts = await createPosts(users, tags);
    await createPostTags(posts, tags);
    await createComments(users, posts);

    log(`\n${COLORS.green}${COLORS.bold}✅ Database seeded successfully!${COLORS.reset}`);
    log(`${COLORS.green}📊 Created:${COLORS.reset}`);
    log(`   👥 ${users.length} users`);
    log(`   🏷️  ${tags.length} tags`);
    log(`   📄 ${posts.length} posts`);
    log(`   💬 Comments with nested replies`);
    log(`   🔗 Post-tag relationships`);

  } catch (error) {
    log(`${COLORS.red}❌ Seeding failed:${COLORS.reset}`);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});