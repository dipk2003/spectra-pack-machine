import assert from 'node:assert/strict';

const baseUrl = String(process.env.AUTH_E2E_BASE_URL || '').replace(/\/+$/, '');
const email = String(process.env.AUTH_E2E_EMAIL || '');
const password = String(process.env.AUTH_E2E_PASSWORD || '');

assert.ok(baseUrl, 'Set AUTH_E2E_BASE_URL before running the auth E2E check.');
assert.ok(email, 'Set AUTH_E2E_EMAIL before running the auth E2E check.');
assert.ok(password, 'Set AUTH_E2E_PASSWORD before running the auth E2E check.');

const cookieJar = new Map();

const storeResponseCookies = (response) => {
  const getSetCookie = response.headers.getSetCookie?.bind(response.headers);
  const rawHeaders = getSetCookie
    ? getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);

  for (const rawHeader of rawHeaders) {
    const cookieStrings = rawHeader.split(
      /,(?=\s*(?:(?:__Host-|__Secure-)?next-auth\.))/i,
    );

    for (const cookieString of cookieStrings) {
      const pair = cookieString.trim().split(';', 1)[0];
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex > 0) {
        cookieJar.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
      }
    }
  }
};

const cookieHeader = () =>
  Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

const request = async (pathname, init = {}) => {
  const headers = new Headers(init.headers);
  if (cookieJar.size) {
    headers.set('cookie', cookieHeader());
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers,
    redirect: 'manual',
  });
  storeResponseCookies(response);
  return response;
};

const csrfResponse = await request('/api/auth/csrf', {
  headers: { accept: 'application/json' },
});
assert.equal(csrfResponse.status, 200);
const csrfBody = await csrfResponse.json();
assert.ok(csrfBody.csrfToken, 'CSRF token was not returned.');

const callbackResponse = await request('/api/auth/callback/credentials', {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    csrfToken: csrfBody.csrfToken,
    email,
    password,
    callbackUrl: `${baseUrl}/admin`,
    json: 'true',
  }),
});
const callbackBody = await callbackResponse.json();
assert.equal(
  callbackResponse.status,
  200,
  `Credentials callback failed with ${callbackResponse.status}: ${callbackBody.url || 'missing URL'}`,
);
assert.equal(callbackBody.url, `${baseUrl}/admin`);

const sessionCookieName = Array.from(cookieJar.keys()).find((name) =>
  name.endsWith('next-auth.session-token'),
);
assert.ok(sessionCookieName, 'NextAuth session cookie was not issued.');

const sessionResponse = await request('/api/auth/session', {
  headers: { accept: 'application/json' },
});
assert.equal(sessionResponse.status, 200);
const sessionBody = await sessionResponse.json();
assert.ok(sessionBody.user?.id, 'Authenticated session user id is missing.');
assert.ok(sessionBody.user?.role, 'Authenticated session role is missing.');

const adminResponse = await request('/admin');
assert.equal(
  adminResponse.status,
  200,
  `Protected admin route rejected the valid session with ${adminResponse.status}.`,
);

console.log(
  `Auth E2E passed: callback=${callbackResponse.status}, session=${sessionResponse.status}, admin=${adminResponse.status}.`,
);
