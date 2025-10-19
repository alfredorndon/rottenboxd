/**
 * NextAuth Options
 * Configuración de NextAuth para uso en API routes
 */

import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import { validateUserCredentials } from '@/lib/user';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        // Validar credenciales
        const user = await validateUserCredentials(
          credentials.email,
          credentials.password
        );

        if (!user) {
          throw new Error('Credenciales inválidas');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      // Agregar ID de usuario al token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Agregar ID de usuario a la sesión
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
