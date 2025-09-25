import { BaseCommand } from '../base.command';
import { db } from '../../lib/database';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';

export class SeedCommand extends BaseCommand {
  private userService: UserService;
  private postService: PostService;

  constructor() {
    super('Database Seeding');
    this.userService = new UserService();
    this.postService = new PostService();
  }

  async execute(): Promise<void> {
    this.logStart('database seeding');

    try {
      // Connect to database
      await db.connect();

      // Clear existing data
      await this.clearData();

      // Create seed data
      const users = await this.createUsers();
      const tags = await this.createTags();
      const posts = await this.createPosts(users);
      await this.createPostTags(posts, tags);
      await this.createComments(users, posts);

      // Show summary
      this.showSummary(users.length, tags.length, posts.length);

      this.logSuccess('database seeding', `${users.length} users, ${tags.length} tags, ${posts.length} posts`);
    } catch (error) {
      this.logError('database seeding', error);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  private async clearData(): Promise<void> {
    this.logStep('Clearing existing data');

    await db.prisma.postTag.deleteMany();
    await db.prisma.comment.deleteMany();
    await db.prisma.post.deleteMany();
    await db.prisma.tag.deleteMany();
    await db.prisma.user.deleteMany();
  }

  private async createUsers(): Promise<any[]> {
    this.logStep('Creating users');

    const userData = [
      {
        email: 'john@example.com',
        username: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer and tech enthusiast.',
        isAdmin: true
      },
      {
        email: 'jane@example.com',
        username: 'jane_smith',
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Frontend developer who loves React and TypeScript.'
      },
      {
        email: 'bob@example.com',
        username: 'bob_wilson',
        firstName: 'Bob',
        lastName: 'Wilson',
        bio: 'Backend engineer specializing in Node.js and databases.'
      }
    ];

    const users = [];
    for (const data of userData) {
      const user = await this.userService.create(data);
      users.push(user);
    }

    return users;
  }

  private async createTags(): Promise<any[]> {
    this.logStep('Creating tags');

    const tagData = [
      { name: 'Technology', slug: 'technology', description: 'Posts about technology and programming', color: '#3B82F6' },
      { name: 'Tutorial', slug: 'tutorial', description: 'Step-by-step guides and tutorials', color: '#10B981' },
      { name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming language', color: '#F59E0B' },
      { name: 'React', slug: 'react', description: 'React.js library and ecosystem', color: '#06B6D4' },
      { name: 'Node.js', slug: 'nodejs', description: 'Node.js runtime and backend development', color: '#84CC16' }
    ];

    const tags = [];
    for (const data of tagData) {
      const tag = await db.prisma.tag.create({ data });
      tags.push(tag);
    }

    return tags;
  }

  private async createPosts(users: any[]): Promise<any[]> {
    this.logStep('Creating posts');

    const postData = [
      {
        title: 'Getting Started with Elysia and Prisma',
        slug: 'getting-started-elysia-prisma',
        content: '# Getting Started with Elysia and Prisma\\n\\nElysia is a fast and modern TypeScript framework...',
        excerpt: 'Learn how to set up a modern web application using Elysia framework and Prisma ORM.',
        status: 'PUBLISHED' as const,
        author_id: users[0].id,
        viewCount: 245,
        likeCount: 18
      },
      {
        title: 'Advanced TypeScript Patterns',
        slug: 'advanced-typescript-patterns',
        content: '# Advanced TypeScript Patterns\\n\\nTypeScript has evolved significantly...',
        excerpt: 'Explore advanced TypeScript patterns that make backend development more robust.',
        status: 'PUBLISHED' as const,
        author_id: users[1].id,
        viewCount: 189,
        likeCount: 23
      },
      {
        title: 'Building Scalable APIs',
        slug: 'building-scalable-apis',
        content: '# Building Scalable APIs\\n\\nCreating scalable APIs requires...',
        excerpt: 'A comprehensive guide to building APIs that scale with your business needs.',
        status: 'PUBLISHED' as const,
        author_id: users[2].id,
        viewCount: 156,
        likeCount: 12
      },
      {
        title: 'Database Migrations: A Rails-inspired Approach',
        slug: 'database-migrations-rails-inspired',
        content: '# Database Migrations\\n\\nOne of the best features of Ruby on Rails...',
        excerpt: 'Learn how to implement Rails-like database migrations in your Node.js projects.',
        status: 'DRAFT' as const,
        author_id: users[0].id
      }
    ];

    const posts = [];
    for (const data of postData) {
      const post = await this.postService.create(data);
      posts.push(post);
    }

    return posts;
  }

  private async createPostTags(posts: any[], tags: any[]): Promise<void> {
    this.logStep('Creating post-tag relationships');

    const relations = [
      { postIndex: 0, tagIndexes: [0, 1] }, // Elysia post
      { postIndex: 1, tagIndexes: [0, 2] }, // TypeScript post
      { postIndex: 2, tagIndexes: [0, 4] }, // Scalable APIs
      { postIndex: 3, tagIndexes: [0, 1] }  // Migrations
    ];

    for (const relation of relations) {
      for (const tagIndex of relation.tagIndexes) {
        await db.prisma.postTag.create({
          data: {
            post_id: posts[relation.postIndex].id,
            tag_id: tags[tagIndex].id
          }
        });
      }
    }
  }

  private async createComments(users: any[], posts: any[]): Promise<void> {
    this.logStep('Creating comments');

    const comments = [
      {
        content: 'Great introduction! This helped me get started quickly.',
        author_id: users[1].id,
        post_id: posts[0].id
      },
      {
        content: 'Thanks for sharing this. Very helpful guide.',
        author_id: users[2].id,
        post_id: posts[0].id
      },
      {
        content: 'These patterns are really useful in my projects.',
        author_id: users[0].id,
        post_id: posts[1].id
      }
    ];

    for (const data of comments) {
      await db.prisma.comment.create({ data });
    }
  }

  private showSummary(userCount: number, tagCount: number, postCount: number): void {
    console.log(`
📊 Database Seeding Summary:
  👥 Users: ${userCount}
  🏷️  Tags: ${tagCount}
  📄 Posts: ${postCount}
  💬 Comments: Created with relationships
  🔗 Post-tag relationships: Established
`);
  }
}