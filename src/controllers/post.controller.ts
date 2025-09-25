import { Elysia, t } from 'elysia';
import { PostService } from '../services/post.service';
import { logger } from '../utils/logger';

const postService = new PostService();

export const postController = new Elysia({ prefix: '/posts' })
  .get('/', async ({ set }) => {
    logger.api.request('GET', '/posts');

    try {
      const posts = await postService.findAll();
      const count = await postService.count();

      logger.api.response(200, '/posts');
      return {
        success: true,
        data: posts,
        count
      };
    } catch (error) {
      logger.api.error('/posts', error instanceof Error ? error.message : 'Unknown error');
      set.status = 500;
      return {
        success: false,
        error: 'Failed to fetch posts'
      };
    }
  })

  .get('/:id', async ({ params: { id }, set }) => {
    logger.api.request('GET', `/posts/${id}`);

    try {
      const post = await postService.findById(id);

      if (!post) {
        logger.api.response(404, `/posts/${id}`);
        set.status = 404;
        return {
          success: false,
          error: 'Post not found'
        };
      }

      logger.api.response(200, `/posts/${id}`);
      return {
        success: true,
        data: post
      };
    } catch (error) {
      logger.api.error(`/posts/${id}`, error instanceof Error ? error.message : 'Unknown error');
      set.status = 500;
      return {
        success: false,
        error: 'Failed to fetch post'
      };
    }
  })

  .post('/', async ({ body, set }) => {
    logger.api.request('POST', '/posts');

    try {
      const post = await postService.create(body as any);

      logger.api.response(201, '/posts');
      set.status = 201;
      return {
        success: true,
        data: post
      };
    } catch (error) {
      logger.api.error('/posts', error instanceof Error ? error.message : 'Unknown error');
      set.status = 500;
      return {
        success: false,
        error: 'Failed to create post'
      };
    }
  }, {
    body: t.Object({
      title: t.String(),
      slug: t.String(),
      content: t.Optional(t.String()),
      excerpt: t.Optional(t.String()),
      status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED')])),
      authorId: t.String(),
      viewCount: t.Optional(t.Number()),
      likeCount: t.Optional(t.Number())
    })
  });