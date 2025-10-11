/**
 * Movie Detail Page
 * Muestra detalles de una película y permite calificarla
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { imageUrl } from '@/lib/tmdb';
import StarRating from '@/app/components/StarRating';
import Button from '@/app/components/Button';

export default function MovieDetailPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movies/${params.tmdbId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Error al cargar película');
        }
        
        setMovie(data.movie);

        // Cargar rating del usuario si está logueado
        if (session) {
          const ratingRes = await fetch(`/api/ratings?tmdbId=${params.tmdbId}`);
          const ratingData = await ratingRes.json();
          if (ratingData.rating) {
            setUserRating(ratingData.rating.rating);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [params.tmdbId, session]);

  const handleRate = async (rating) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId: params.tmdbId,
          rating,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar rating');
      }

      setUserRating(rating);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-red-400 mb-4">
          {error || 'Película no encontrada'}
        </p>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Poster */}
        <div className="sticky top-24 self-start">
          <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
            {movie.poster ? (
              <img
                src={imageUrl(movie.poster, 'w500')}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {movie.title}
          </h1>
          
          {movie.year && (
            <p className="text-xl text-gray-400 mb-6">{movie.year}</p>
          )}

          {/* Géneros */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-emerald-600/20 border border-emerald-600/50 rounded-full text-emerald-400 text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Runtime */}
          {movie.runtime && (
            <p className="text-gray-400 mb-6">
              <span className="font-semibold">Duración:</span> {movie.runtime} min
            </p>
          )}

          {/* Overview */}
          {movie.overview && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Sinopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Rating */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {session ? 'Tu Calificación' : 'Calificar'}
            </h2>
            
            {session ? (
              <div>
                <StarRating 
                  rating={userRating} 
                  onRate={handleRate} 
                  size="lg"
                />
                {userRating > 0 && (
                  <p className="text-emerald-400 mt-3">
                    Has calificado esta película con {userRating} estrella{userRating > 1 ? 's' : ''}
                  </p>
                )}
                {saving && (
                  <p className="text-gray-400 mt-3">Guardando...</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">
                  Inicia sesión para calificar esta película
                </p>
                <Link href="/login">
                  <Button>Iniciar Sesión</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Keywords */}
          {movie.keywords && movie.keywords.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {movie.keywords.slice(0, 15).map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-gray-800 rounded text-gray-400 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

