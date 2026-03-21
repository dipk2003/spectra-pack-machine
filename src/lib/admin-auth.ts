import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function isAdminRequest(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.email || !process.env.ADMIN_EMAIL) {
    return false;
  }

  return token.email === process.env.ADMIN_EMAIL;
}
