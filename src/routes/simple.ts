import { Elysia } from 'elysia';
import { prisma } from '../database';

export const simpleRoutes = new Elysia({ prefix: '/simple' })
  .get('/posts', async () => {
    console.log('📄 [SIMPLE] Fetching all posts with basic query...');

    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ [SIMPLE] Retrieved ${posts.length} posts successfully`);
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} (${post.status})`);
    });

    return {
      success: true,
      data: posts,
      count: posts.length
    };
  })

  .get('/users', async () => {
    console.log('👥 [SIMPLE] Fetching all users with basic query...');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ [SIMPLE] Retrieved ${users.length} users successfully`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. @${user.username} (${user.email})`);
    });

    return {
      success: true,
      data: users,
      count: users.length
    };
  })

  .get('/stats', async () => {
    console.log('📊 [SIMPLE] Fetching database statistics...');

    const userCount = await prisma.user.count();
    console.log(`   📈 Users: ${userCount}`);

    const postCount = await prisma.post.count();
    console.log(`   📈 Posts: ${postCount}`);

    const publishedPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' }
    });
    console.log(`   📈 Published Posts: ${publishedPosts}`);

    const commentCount = await prisma.comment.count();
    console.log(`   📈 Comments: ${commentCount}`);

    const tagCount = await prisma.tag.count();
    console.log(`   📈 Tags: ${tagCount}`);

    console.log('✅ [SIMPLE] Database statistics retrieved successfully');

    return {
      success: true,
      data: {
        users: userCount,
        posts: postCount,
        publishedPosts: publishedPosts,
        comments: commentCount,
        tags: tagCount
      },
      rails_like_features: {
        database_migrations: "✅ Working",
        database_seeding: "✅ Working",
        console_logging: "✅ Working",
        rest_api: "✅ Working"
      }
    };
  });