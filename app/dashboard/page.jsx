/**
 * Dashboard Page
 * Muestra recomendaciones y películas calificadas del usuario
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MovieCard from '../components/MovieCard';
import { imageUrl } from '@/lib/tmdb';
import StarRating from '../components/StarRating';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [recommendations, setRecommendations] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [recommendationType, setRecommendationType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchData() {
      setLoading(true);
      
      try {
        // Fetch recomendaciones
        const recoRes = await fetch('/api/recommendations?limit=24');
        const recoData = await recoRes.json();
        setRecommendations(recoData.recommendations || []);
        setRecommendationType(recoData.type);

        // Fetch ratings del usuario
        const ratingsRes = await fetch('/api/ratings/user');
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          setRatings(ratingsData.ratings || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Mi Dashboard
        </h1>
        <p className="text-gray-400">
          Bienvenido, {session.user.name}
        </p>
      </div>

      {/* Recomendaciones */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Recomendaciones para ti
            </h2>
            {recommendationType === 'cold-start' && (
              <p className="text-sm text-amber-400 mt-1">
                💡 Califica al menos 3 películas con 4-5★ para obtener recomendaciones personalizadas
              </p>
            )}
            {recommendationType === 'content-based' && (
              <p className="text-sm text-emerald-400 mt-1">
                ✨ Basadas en tus gustos
              </p>
            )}
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recommendations.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              No hay recomendaciones disponibles todavía.
            </p>
            <Link href="/" className="text-emerald-500 hover:text-emerald-400 mt-2 inline-block">
              Explora películas
            </Link>
          </div>
        )}
      </section>

      {/* Tus Calificaciones */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">
          Tus Calificaciones
        </h2>

        {ratings.length > 0 ? (
          <div className="grid gap-4">
            {ratings.slice(0, 10).map((rating) => (
              <Link
                key={rating._id}
                href={`/movie/${rating.movieId.tmdbId}`}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-600 transition-colors"
              >
                <div className="w-16 h-24 flex-shrink-0">
                  {rating.movieId.poster ? (
                    <img
                      src={imageUrl(rating.movieId.poster, 'w92')}
                      alt={rating.movieId.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                      🎬
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {rating.movieId.title}
                  </h3>
                  {rating.movieId.year && (
                    <p className="text-sm text-gray-400 mb-2">
                      {rating.movieId.year}
                    </p>
                  )}
                  <StarRating rating={rating.rating} readonly size="sm" />
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(rating.createdAt).toLocaleDateString('es-MX')}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-2">
              Aún no has calificado ninguna película
            </p>
            <Link href="/" className="text-emerald-500 hover:text-emerald-400">
              Comienza a calificar
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
