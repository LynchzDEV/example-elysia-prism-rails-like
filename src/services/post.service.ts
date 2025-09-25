import { Post, PostStatus } from '@prisma/client';
import { prisma } from '../lib/database';
import { BaseService } from './base.service';

export type CreatePostInput = {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  authorId: string;
};

export type PostWithAuthor = Post & {
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count: {
    comments: number;
  };
};

export class PostService extends BaseService {
  constructor() {
    super('PostService');
  }

  async findAll(): Promise<PostWithAuthor[]> {
    this.logOperation('Finding all posts');

    try {
      const posts = await prisma.post.findMany({
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }) as PostWithAuthor[];

      this.logSuccess(`Found ${posts.length} posts`);
      return posts;
    } catch (error) {
      this.logError('Finding all posts', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Post | null> {
    this.logOperation('Finding post by ID', { id });

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              bio: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true
                }
              }
            },
            where: { parentId: null },
            orderBy: { created_at: 'asc' }
          }
        }
      });

      if (post) {
        // Increment view count
        await prisma.post.update({
          where: { id },
          data: { viewCount: { increment: 1 } }
        });

        this.logSuccess(`Found post: ${post.title} (views: ${post.viewCount + 1})`);
      } else {
        this.logOperation(`Post not found with ID: ${id}`);
      }

      return post;
    } catch (error) {
      this.logError('Finding post by ID', error);
      throw error;
    }
  }

  async create(data: CreatePostInput): Promise<Post> {
    this.logOperation('Creating new post', { title: data.title, authorId: data.authorId });

    try {
      const post = await prisma.post.create({
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          status: data.status || 'DRAFT',
          author_id: data.authorId,
          published_at: data.status === 'PUBLISHED' ? new Date() : null
        }
      });

      this.logSuccess(`Created post: ${post.title} (${post.id})`);
      return post;
    } catch (error) {
      this.logError('Creating post', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    this.logOperation('Counting posts');

    try {
      const count = await prisma.post.count();
      this.logSuccess(`Post count: ${count}`);
      return count;
    } catch (error) {
      this.logError('Counting posts', error);
      throw error;
    }
  }

  async countByStatus(status: PostStatus): Promise<number> {
    this.logOperation(`Counting ${status} posts`);

    try {
      const count = await prisma.post.count({
        where: { status }
      });
      this.logSuccess(`${status} post count: ${count}`);
      return count;
    } catch (error) {
      this.logError(`Counting ${status} posts`, error);
      throw error;
    }
  }
}