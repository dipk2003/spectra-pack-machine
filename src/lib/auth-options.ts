import '@/lib/init-auth-env';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getConfiguredEnvAdmin, matchesConfiguredEnvAdmin } from '@/lib/admin-identity';
import { getAdminUserByUserId } from '@/lib/admin-users';
import {
  createSupabasePublicClient,
  hasSupabasePublicConfig,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { assertSecureAuthConfig, getNextAuthSecret } from '@/lib/runtime-config';
import { OperationTimeoutError, withTimeout } from '@/lib/async-timeout';

const SUPABASE_LOGIN_TIMEOUT_MS = 10_000;

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = credentials.email.trim().toLowerCase();

        try {
          assertSecureAuthConfig();

          if (hasSupabasePublicConfig() && isSupabaseConfigured()) {
            const supabase = createSupabasePublicClient();
            const { data, error } = await withTimeout(
              supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: credentials.password,
              }),
              SUPABASE_LOGIN_TIMEOUT_MS,
              'Supabase admin sign-in',
            );

            if (!error && data.user) {
              const adminUser = await getAdminUserByUserId(data.user.id);
              if (adminUser) {
                return {
                  id: data.user.id,
                  email: data.user.email || adminUser.email,
                  name:
                    adminUser.displayName ||
                    String(data.user.user_metadata?.full_name || '').trim() ||
                    data.user.email ||
                    'Admin',
                  role: adminUser.role,
                };
              }
            }
          }
        } catch (error) {
          if (error instanceof OperationTimeoutError) {
            console.warn('Admin sign-in dependency timed out.');
          } else {
            console.warn('Admin sign-in dependency failed.');
          }
          // Fall back to env-based admin credentials below.
        }

        if (matchesConfiguredEnvAdmin(normalizedEmail, credentials.password)) {
          const configuredAdmin = getConfiguredEnvAdmin();

          if (configuredAdmin) {
            return {
              id: configuredAdmin.id,
              email: configuredAdmin.email,
              name: configuredAdmin.displayName,
              role: configuredAdmin.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id;
        }

        if (typeof token.role === 'string') {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};
