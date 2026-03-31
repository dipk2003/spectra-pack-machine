const PLACEHOLDER_PATTERNS = ['YOUR_', 'change-this', 'ChangeThis', 'replace-with-your'];

const hasPlaceholderValue = (value: string) =>
  !value || PLACEHOLDER_PATTERNS.some((pattern) => value.includes(pattern));

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const getConfiguredEnvAdmin = () => {
  const email = normalizeEmail(process.env.ADMIN_EMAIL || '');
  const password = String(process.env.ADMIN_PASSWORD || '');
  const displayName = String(process.env.ADMIN_NAME || '').trim() || 'Admin';

  if (
    !email ||
    !password ||
    hasPlaceholderValue(email)
  ) {
    return null;
  }

  return {
    id: `env-admin:${email}`,
    email,
    password,
    displayName,
    role: 'owner',
  } as const;
};

export const matchesConfiguredEnvAdmin = (email: string, password: string) => {
  const configuredAdmin = getConfiguredEnvAdmin();
  if (!configuredAdmin) {
    return false;
  }

  return (
    normalizeEmail(email) === configuredAdmin.email &&
    password === configuredAdmin.password
  );
};

export const isConfiguredEnvAdminId = (userId: string) => {
  const configuredAdmin = getConfiguredEnvAdmin();
  return Boolean(configuredAdmin && configuredAdmin.id === userId);
};
