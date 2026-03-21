import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { timingSafeEqual } from 'node:crypto';

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const handler = NextAuth({
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
          const adminEmail = process.env.ADMIN_EMAIL || '';
          const adminPassword = process.env.ADMIN_PASSWORD || '';

          const isEmailValid = safeEqual(credentials.email, adminEmail);
          const isPasswordValid = safeEqual(credentials.password, adminPassword);

          if (!isEmailValid || !isPasswordValid) return null;

          return {
            id: 'spectra-pack-admin',
            email: adminEmail,
            name: process.env.ADMIN_NAME || 'Admin',
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
