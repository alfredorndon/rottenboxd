/**
 * Home Page
 * Muestra películas populares o resultados de búsqueda
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from './components/MovieCard';

export default function HomePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      
      try {
        const url = query 
          ? `/api/movies?query=${encodeURIComponent(query)}`
          : '/api/movies?limit=40';
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Error al cargar películas');
        }
        
        setMovies(data.movies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [query]);

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-emerald-500">
          rottenboxd
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Descubre películas, califica tus favoritas y obtén recomendaciones personalizadas
        </p>
      </section>

      {/* Título de sección */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {query ? `Resultados para "${query}"` : 'Películas Populares'}
        </h2>
        {!loading && (
          <p className="text-gray-400 mt-2">
            {movies.length} película{movies.length !== 1 ? 's' : ''} encontrada{movies.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Grid de películas */}
      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500 mb-2">No se encontraron películas</p>
          {query && (
            <p className="text-gray-600">
              Intenta con otra búsqueda
            </p>
          )}
        </div>
      )}
    </div>
  );
}

