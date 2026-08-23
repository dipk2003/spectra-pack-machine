import assert from 'node:assert/strict';

const baseUrl = String(process.env.AUTH_E2E_BASE_URL || '').replace(/\/+$/, '');
const email = String(process.env.AUTH_E2E_EMAIL || process.env.ADMIN_EMAIL || '');
const password = String(process.env.AUTH_E2E_PASSWORD || process.env.ADMIN_PASSWORD || '');
const expectDeveloper = process.env.AUTH_E2E_EXPECT_DEVELOPER === 'true';
const developerPin = String(process.env.AUTH_E2E_DEVELOPER_PIN || '');

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
      /,(?=\s*(?:(?:__Host-|__Secure-)?(?:next-auth\.|spectra-developer-pin)))/i,
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
if (expectDeveloper) {
  assert.equal(sessionBody.user.role, 'owner', 'Developer owner session role is missing.');
}

const adminResponse = await request('/admin');
assert.equal(
  adminResponse.status,
  200,
  `Protected admin route rejected the valid session with ${adminResponse.status}.`,
);

let developerStatus = 'not-requested';
if (expectDeveloper) {
  const adminHtml = await adminResponse.text();
  assert.ok(
    adminHtml.includes('href="/admin/developer"'),
    'Developer navigation option is missing from the authenticated admin page.',
  );

  const developerPageResponse = await request('/admin/developer');
  assert.equal(
    developerPageResponse.status,
    200,
    `Developer page rejected the owner session with ${developerPageResponse.status}.`,
  );
  const developerPageHtml = await developerPageResponse.text();
  assert.ok(
    developerPageHtml.includes('Create Developer PIN') ||
      developerPageHtml.includes('Unlock Developer Operations') ||
      developerPageHtml.includes('Developer Operations'),
    'Developer page did not render its PIN gate or unlocked dashboard.',
  );

  const crossSitePinResponse = await request('/api/admin/developer/pin', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://attacker.example',
      'sec-fetch-site': 'cross-site',
    },
    body: JSON.stringify({ action: 'unlock', pin: '000000' }),
  });
  assert.equal(crossSitePinResponse.status, 403, 'Cross-site PIN request was not rejected.');

  const privateSettingResponse = await request('/api/site-settings', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: baseUrl,
    },
    body: JSON.stringify({
      key: 'developer-panel-pin-hash',
      value: 'must-not-be-written',
    }),
  });
  assert.equal(
    privateSettingResponse.status,
    403,
    'Generic site-settings API accepted a private Developer PIN setting.',
  );

  let developerApiResponse = await request('/api/admin/developer', {
    headers: { accept: 'application/json' },
  });
  if (developerApiResponse.status === 423 && developerPin) {
    const unlockResponse = await request('/api/admin/developer/pin', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        origin: baseUrl,
      },
      body: JSON.stringify({ action: 'unlock', pin: developerPin }),
    });
    assert.equal(
      unlockResponse.status,
      200,
      `Developer PIN unlock failed with ${unlockResponse.status}.`,
    );
    developerApiResponse = await request('/api/admin/developer', {
      headers: { accept: 'application/json' },
    });
  }

  if (!developerPin) {
    assert.equal(
      developerApiResponse.status,
      423,
      `Locked Developer API should return 423, received ${developerApiResponse.status}.`,
    );
    const lockedBody = await developerApiResponse.json();
    assert.equal(lockedBody.code, 'DEVELOPER_PIN_REQUIRED');
    developerStatus = 'page=200, api=423 (PIN locked)';
  } else {
    assert.equal(
      developerApiResponse.status,
      200,
      `Developer API rejected the unlocked owner session with ${developerApiResponse.status}.`,
    );
  const developerBody = await developerApiResponse.json();
  assert.equal(developerBody.access?.mode, 'explicit-owner-id');
  assert.ok(developerBody.analytics, 'Developer analytics payload is missing.');
  assert.ok(developerBody.operations, 'Developer operations payload is missing.');
    assert.ok(developerBody.pipeline, 'Developer lead pipeline payload is missing.');
    assert.ok(developerBody.advertising, 'Developer advertising payload is missing.');
    developerStatus = 'page=200, api=200 (PIN unlocked)';
  }
}

console.log(
  `Auth E2E passed: callback=${callbackResponse.status}, session=${sessionResponse.status}, admin=${adminResponse.status}, developer=${developerStatus}.`,
);
