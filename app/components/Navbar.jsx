/**
 * Navbar Component
 * Barra de navegación sticky con búsqueda y enlaces
 */

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientOnly from './ClientOnly';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            rottenboxd
          </Link>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar películas..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </form>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Películas
            </Link>
            
            <ClientOnly fallback={
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            }>
              {session ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Perfil
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {session.user.name}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    </nav>
  );
}

