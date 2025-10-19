/**
 * NextAuth Configuration
 * Usa Credentials Provider con bcrypt para autenticación
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

