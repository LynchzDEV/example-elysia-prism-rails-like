import { User, Prisma } from '@prisma/client';
import { prisma } from '../lib/database';
import { BaseService } from './base.service';

export type CreateUserInput = {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
};

export type UserWithStats = User & {
  _count: {
    posts: number;
    comments: number;
  };
};

export class UserService extends BaseService {
  constructor() {
    super('UserService');
  }

  async findAll(): Promise<UserWithStats[]> {
    this.logOperation('Finding all users');

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          first_name: true,
          last_name: true,
          bio: true,
          avatar_url: true,
          is_admin: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }) as UserWithStats[];

      this.logSuccess(`Found ${users.length} users`);
      return users;
    } catch (error) {
      this.logError('Finding all users', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    this.logOperation('Finding user by ID', { id });

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              createdAt: true
            },
            orderBy: { created_at: 'desc' }
          },
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        }
      });

      if (user) {
        this.logSuccess(`Found user: ${user.username}`);
      } else {
        this.logOperation(`User not found with ID: ${id}`);
      }

      return user;
    } catch (error) {
      this.logError('Finding user by ID', error);
      throw error;
    }
  }

  async create(data: CreateUserInput): Promise<User> {
    this.logOperation('Creating new user', { username: data.username, email: data.email });

    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          first_name: data.firstName,
          last_name: data.lastName,
          bio: data.bio,
          avatar_url: data.avatarUrl,
          is_admin: data.isAdmin || false
        }
      });

      this.logSuccess(`Created user: ${user.username} (${user.id})`);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        this.logError('Creating user', 'Email or username already exists');
        throw new Error('Email or username already exists');
      }
      this.logError('Creating user', error);
      throw error;
    }
  }

  async count(): Promise<number> {
    this.logOperation('Counting users');

    try {
      const count = await prisma.user.count();
      this.logSuccess(`User count: ${count}`);
      return count;
    } catch (error) {
      this.logError('Counting users', error);
      throw error;
    }
  }
}