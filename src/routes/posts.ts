import { Elysia, t } from 'elysia';
import { prisma } from '../database';

export const postsRoutes = new Elysia({ prefix: '/posts' })
  .get('/', async () => {
    console.log('📄 Fetching all posts...');

    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          }
        },
        post_tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ Retrieved ${posts.length} posts`);

    return {
      success: true,
      data: posts,
      count: posts.length
    };
  })

  .get('/:id', async ({ params: { id } }) => {
    console.log(`📄 Fetching post with ID: ${id}`);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            bio: true,
            avatar_url: true
          }
        },
        post_tags: {
          include: {
            tag: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true
              }
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          },
          where: {
            parent_id: null // Only get top-level comments
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });

    if (!post) {
      console.log(`❌ Post not found: ${id}`);
      return {
        success: false,
        error: 'Post not found',
        data: null
      };
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: {
        view_count: {
          increment: 1
        }
      }
    });

    console.log(`✅ Retrieved post: ${post.title}`);

    return {
      success: true,
      data: post
    };
  })

  .post('/', async ({ body }) => {
    console.log('📝 Creating new post...');
    console.log('Post data:', body);

    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        status: body.status || 'DRAFT',
        author_id: body.author_id,
        published_at: body.status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    console.log(`✅ Created post: ${post.title} (ID: ${post.id})`);

    return {
      success: true,
      data: post,
      message: 'Post created successfully'
    };
  }, {
    body: t.Object({
      title: t.String(),
      slug: t.String(),
      content: t.Optional(t.String()),
      excerpt: t.Optional(t.String()),
      status: t.Optional(t.Union([t.Literal('DRAFT'), t.Literal('PUBLISHED'), t.Literal('ARCHIVED')])),
      author_id: t.String()
    })
  });