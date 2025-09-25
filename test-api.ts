#!/usr/bin/env bun

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

async function testEndpoint(url: string, description: string) {
  try {
    log(`📡 Testing: ${description}`, 'blue');
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      log(`✅ ${description} - SUCCESS`, 'green');
      console.log('Response:', JSON.stringify(data, null, 2));
      return data;
    } else {
      log(`❌ ${description} - FAILED (${response.status})`, 'red');
      console.log('Error:', data);
      return null;
    }
  } catch (error) {
    log(`❌ ${description} - ERROR`, 'red');
    console.error(error);
    return null;
  }
}

async function main() {
  log(`${COLORS.bold}${COLORS.blue}🧪 API Testing Suite${COLORS.reset}`);
  log('==================\n');

  const baseUrl = 'http://localhost:3000';

  // Wait for server to be ready
  log('⏳ Waiting for server to start...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test root endpoint
  await testEndpoint(`${baseUrl}/`, 'Root API Info');
  console.log('\n---\n');

  // Test health endpoint
  await testEndpoint(`${baseUrl}/health`, 'Health Check');
  console.log('\n---\n');

  // Test posts endpoint
  const posts = await testEndpoint(`${baseUrl}/posts`, 'Get All Posts');
  console.log('\n---\n');

  // Test specific post if available
  if (posts && posts.data && posts.data.length > 0) {
    const firstPost = posts.data[0];
    await testEndpoint(`${baseUrl}/posts/${firstPost.id}`, `Get Post: ${firstPost.title}`);
    console.log('\n---\n');
  }

  // Test users endpoint
  const users = await testEndpoint(`${baseUrl}/users`, 'Get All Users');
  console.log('\n---\n');

  // Test specific user if available
  if (users && users.data && users.data.length > 0) {
    const firstUser = users.data[0];
    await testEndpoint(`${baseUrl}/users/${firstUser.id}`, `Get User: ${firstUser.username}`);
    console.log('\n---\n');
  }

  log(`${COLORS.green}${COLORS.bold}✅ API Testing Complete!${COLORS.reset}`);
  log('Check the server console for detailed logging output.', 'yellow');
}

main().catch(console.error);