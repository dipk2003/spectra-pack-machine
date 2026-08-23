import assert from 'node:assert/strict';

const TEST_SECRET = 'spectra-auth-contract-test-secret-not-for-production';
const TEST_EMAIL = 'auth-contract@example.test';
const TEST_ADMIN_ID = `env-admin:${TEST_EMAIL}`;

const configureIsolatedTestEnvironment = () => {
  process.env.NEXTAUTH_SECRET = TEST_SECRET;
  process.env.AUTH_SECRET = TEST_SECRET;
  process.env.NEXTAUTH_URL = 'http://localhost:3001,http://localhost:3000';
  process.env.AUTH_URL = '';
  process.env.SITE_ORIGIN = 'https://spectrapackmachines.com';
  process.env.ADMIN_EMAIL = TEST_EMAIL;
  process.env.ADMIN_PASSWORD = 'contract-test-only-not-a-real-password';
  process.env.ADMIN_NAME = 'Auth Contract Test';

  // Keep this test deterministic and offline: rate limiting uses its local
  // fallback and authentication uses the isolated env-admin credentials above.
  process.env.NEXT_PUBLIC_SUPABASE_URL = '';
  process.env.SUPABASE_URL = '';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = '';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = '';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = '';
  process.env.SUPABASE_SERVICE_KEY = '';
  process.env.SUPABASE_SECRET_KEY = '';
  process.env.SUPABASE_SERVICE_ROLE = '';
};

const main = async () => {
  configureIsolatedTestEnvironment();

  const [{ encode }, { NextRequest }, { middleware }] = await Promise.all([
    import('next-auth/jwt'),
    import('next/server'),
    import('../src/middleware'),
  ]);

  const sessionToken = await encode({
    secret: TEST_SECRET,
    token: {
      id: TEST_ADMIN_ID,
      email: TEST_EMAIL,
      role: 'owner',
    },
  });

  const secureRequest = new NextRequest('https://spectrapackmachines.com/admin', {
    headers: {
      cookie: `__Secure-next-auth.session-token=${sessionToken}`,
      'x-forwarded-proto': 'https',
    },
  });
  const secureResponse = await middleware(secureRequest);
  assert.equal(secureResponse.status, 200);
  assert.equal(secureResponse.headers.get('x-middleware-next'), '1');

  const localRequest = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `next-auth.session-token=${sessionToken}`,
    },
  });
  const localResponse = await middleware(localRequest);
  assert.equal(localResponse.status, 200);
  assert.equal(localResponse.headers.get('x-middleware-next'), '1');

  const proxyMismatchResponse = await middleware(
    new NextRequest('https://spectrapackmachines.com/admin', {
      headers: {
        cookie: `next-auth.session-token=${sessionToken}`,
        'x-forwarded-proto': 'https',
      },
    }),
  );
  assert.equal(proxyMismatchResponse.status, 200);
  assert.equal(proxyMismatchResponse.headers.get('x-middleware-next'), '1');

  const anonymousResponse = await middleware(
    new NextRequest('https://spectrapackmachines.com/admin/products?draft=1'),
  );
  assert.equal(anonymousResponse.status, 307);
  const anonymousRedirect = new URL(anonymousResponse.headers.get('location') || '');
  assert.equal(anonymousRedirect.pathname, '/admin/login');
  assert.equal(anonymousRedirect.searchParams.get('callbackUrl'), '/admin/products?draft=1');

  const { enforceRateLimit, resolveRateLimitPresetName } = await import(
    '../src/lib/rate-limit'
  );

  const credentialsRequest = new NextRequest(
    'https://spectrapackmachines.com/api/auth/callback/credentials',
    {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.254' },
    },
  );
  assert.equal(resolveRateLimitPresetName(credentialsRequest), 'auth');
  assert.equal(
    resolveRateLimitPresetName(
      new NextRequest('https://spectrapackmachines.com/api/admin/developer/pin', {
        method: 'POST',
      }),
    ),
    'developerUnlock',
  );
  assert.equal(
    resolveRateLimitPresetName(
      new NextRequest('https://spectrapackmachines.com/api/auth/signout', {
        method: 'POST',
      }),
    ),
    null,
  );

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const result = await enforceRateLimit(credentialsRequest, 'auth');
    assert.equal(result.limitedResponse, null);
  }

  const { POST: authPost } = await import('../src/app/api/auth/[...nextauth]/route');
  const limitedResponse = await authPost(credentialsRequest, {
    params: { nextauth: ['callback', 'credentials'] },
  });
  assert.equal(limitedResponse.status, 429);
  assert.ok(limitedResponse.headers.get('retry-after'));

  const limitedBody = (await limitedResponse.json()) as { url?: string };
  assert.ok(limitedBody.url, 'Rate-limited NextAuth response must contain a URL.');
  const limitedUrl = new URL(limitedBody.url || '');
  assert.match(limitedUrl.searchParams.get('error') || '', /^RateLimited:\d+$/);

  const { OperationTimeoutError, withTimeout } = await import('../src/lib/async-timeout');
  await assert.rejects(
    withTimeout(new Promise<never>(() => undefined), 25, 'Contract test operation'),
    OperationTimeoutError,
  );

  console.log('Auth contract verification passed.');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
