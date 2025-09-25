import { Elysia, t } from 'elysia';
import { prisma } from '../database';

export const usersRoutes = new Elysia({ prefix: '/users' })
  .get('/', async () => {
    console.log('👥 Fetching all users...');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        bio: true,
        avatar_url: true,
        is_admin: true,
        created_at: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ Retrieved ${users.length} users`);

    return {
      success: true,
      data: users,
      count: users.length
    };
  })

  .get('/:id', async ({ params: { id } }) => {
    console.log(`👤 Fetching user with ID: ${id}`);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        bio: true,
        avatar_url: true,
        is_admin: true,
        created_at: true,
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            status: true,
            view_count: true,
            like_count: true,
            created_at: true,
            published_at: true
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${id}`);
      return {
        success: false,
        error: 'User not found',
        data: null
      };
    }

    console.log(`✅ Retrieved user: ${user.username}`);

    return {
      success: true,
      data: user
    };
  })

  .post('/', async ({ body }) => {
    console.log('👤 Creating new user...');
    console.log('User data:', { ...body, email: '[HIDDEN]' });

    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.username,
          first_name: body.first_name,
          last_name: body.last_name,
          bio: body.bio,
          avatar_url: body.avatar_url,
          is_admin: body.is_admin || false
        },
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          bio: true,
          avatar_url: true,
          is_admin: true,
          created_at: true
        }
      });

      console.log(`✅ Created user: ${user.username} (ID: ${user.id})`);

      return {
        success: true,
        data: user,
        message: 'User created successfully'
      };
    } catch (error: any) {
      console.error('❌ Failed to create user:', error.message);

      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Email or username already exists',
          data: null
        };
      }

      return {
        success: false,
        error: 'Failed to create user',
        data: null
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      username: t.String(),
      first_name: t.Optional(t.String()),
      last_name: t.Optional(t.String()),
      bio: t.Optional(t.String()),
      avatar_url: t.Optional(t.String()),
      is_admin: t.Optional(t.Boolean())
    })
  });