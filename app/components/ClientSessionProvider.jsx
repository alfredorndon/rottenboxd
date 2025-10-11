/**
 * ClientSessionProvider
 * Wrapper para NextAuth SessionProvider (client component)
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientSessionProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

