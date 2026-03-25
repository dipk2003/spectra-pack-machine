import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextRequest } from 'next/server';
import { getAdminUserByUserId } from '@/lib/admin-users';
import { enforceMappedRateLimit } from '@/lib/rate-limit';
import {
  createSupabasePublicClient,
  hasSupabasePublicConfig,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { assertSecureAuthConfig, getNextAuthSecret } from '@/lib/runtime-config';

const handler = NextAuth({
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

        try {
          assertSecureAuthConfig();

          if (!hasSupabasePublicConfig() || !isSupabaseConfigured()) {
            return null;
          }

          const supabase = createSupabasePublicClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email.trim(),
            password: credentials.password,
          });

          if (error || !data.user) return null;

          const adminUser = await getAdminUserByUserId(data.user.id);
          if (!adminUser) return null;

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
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
});

export async function GET(
  req: NextRequest,
  context: { params: { nextauth: string[] } },
) {
  assertSecureAuthConfig();
  return handler(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: { nextauth: string[] } },
) {
  assertSecureAuthConfig();

  const rateLimit = await enforceMappedRateLimit(req);
  if (rateLimit.limitedResponse) {
    return rateLimit.limitedResponse;
  }

  const response = await handler(req, context);
  Object.entries(rateLimit.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
