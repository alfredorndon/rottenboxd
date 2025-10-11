/**
 * MovieCard Component
 * Tarjeta de película con poster y info básica
 */

import Link from 'next/link';
import { imageUrl } from '@/lib/tmdb';

export default function MovieCard({ movie }) {
  return (
    <Link 
      href={`/movie/${movie.tmdbId}`}
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-emerald-600/20">
        {movie.poster ? (
          <img
            src={imageUrl(movie.poster, 'w500')}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        
        {/* Overlay con info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="text-gray-300 text-xs mb-2">{movie.year}</p>
          )}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre) => (
                <span 
                  key={genre}
                  className="text-xs px-2 py-0.5 bg-emerald-600/80 rounded text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

