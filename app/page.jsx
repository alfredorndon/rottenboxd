/**
 * Home Page
 * Muestra películas populares o resultados de búsqueda
 */

import { Suspense } from 'react';
import MovieSearchContent from './components/MovieSearch';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}

export default function HomePage() {
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

      {/* Movie Search con Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        <MovieSearchContent />
      </Suspense>
    </div>
  );
}

