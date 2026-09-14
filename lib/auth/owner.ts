import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';

export type OwnerConfiguration = {
  ownerUserId: string | null;
  isProduction: boolean;
};

export function getOwnerConfiguration(): OwnerConfiguration {
  const ownerUserId = process.env.OWNER_USER_ID?.trim() || null;
  return { ownerUserId, isProduction: process.env.NODE_ENV === 'production' };
}

export async function requireOwner() {
  const user = await getUser();
  if (!user) throw new Error('AUTH_REQUIRED');

  const { ownerUserId, isProduction } = getOwnerConfiguration();
  if (!ownerUserId && isProduction) throw new Error('OWNER_NOT_CONFIGURED');
  if (ownerUserId && user.id !== ownerUserId) throw new Error('OWNER_FORBIDDEN');

  return user;
}

export function ownerErrorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : 'OWNER_AUTH_FAILED';
  if (code === 'AUTH_REQUIRED') {
    return NextResponse.json({ ok: false, error: code, userMessage: 'Pehle sign in karein.' }, { status: 401 });
  }
  if (code === 'OWNER_FORBIDDEN') {
    return NextResponse.json({ ok: false, error: code, userMessage: 'Yeh private owner account hai.' }, { status: 403 });
  }
  if (code === 'OWNER_NOT_CONFIGURED') {
    return NextResponse.json({ ok: false, error: code, userMessage: 'Owner account configure nahi hua hai.' }, { status: 503 });
  }
  return NextResponse.json({ ok: false, error: 'OWNER_AUTH_FAILED', userMessage: 'Access verify nahi ho saka.' }, { status: 500 });
}
