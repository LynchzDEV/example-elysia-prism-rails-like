import { Elysia, t } from 'elysia';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

const userService = new UserService();

export const userController = new Elysia({ prefix: '/users' })
  .get('/', async ({ set }) => {
    logger.api.request('GET', '/users');

    try {
      const users = await userService.findAll();

      logger.api.response(200, '/users');
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      logger.api.error('/users', error instanceof Error ? error.message : 'Unknown error');
      set.status = 500;
      return {
        success: false,
        error: 'Failed to fetch users'
      };
    }
  })

  .get('/:id', async ({ params: { id }, set }) => {
    logger.api.request('GET', `/users/${id}`);

    try {
      const user = await userService.findById(id);

      if (!user) {
        logger.api.response(404, `/users/${id}`);
        set.status = 404;
        return {
          success: false,
          error: 'User not found'
        };
      }

      logger.api.response(200, `/users/${id}`);
      return {
        success: true,
        data: user
      };
    } catch (error) {
      logger.api.error(`/users/${id}`, error instanceof Error ? error.message : 'Unknown error');
      set.status = 500;
      return {
        success: false,
        error: 'Failed to fetch user'
      };
    }
  })

  .post('/', async ({ body, set }) => {
    logger.api.request('POST', '/users');

    try {
      const user = await userService.create(body);

      logger.api.response(201, '/users');
      set.status = 201;
      return {
        success: true,
        data: user,
        message: 'User created successfully'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.api.error('/users', errorMessage);

      if (errorMessage.includes('already exists')) {
        set.status = 409;
        return {
          success: false,
          error: errorMessage
        };
      }

      set.status = 500;
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      username: t.String({ minLength: 3 }),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      bio: t.Optional(t.String()),
      avatarUrl: t.Optional(t.String({ format: 'uri' })),
      isAdmin: t.Optional(t.Boolean())
    })
  });