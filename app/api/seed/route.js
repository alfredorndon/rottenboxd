/**
 * Seed Endpoint (TEMPORAL)
 * POST /api/seed - Pobla la base de datos en producción
 * ⚠️ REMOVER después de usar
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Movie from '@/models/Movie';
import { tmdb } from '@/lib/tmdb';

export async function POST(request) {
  try {
    // Verificar que sea una petición autorizada (opcional)
    const { secret } = await request.json();
    
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();

    let totalMovies = 0;
    const PAGES = 3; // Menos páginas para producción

    for (let page = 1; page <= PAGES; page++) {
      console.log(`📄 Descargando página ${page}/${PAGES}...`);

      const popularData = await tmdb(`/movie/popular?language=es-MX&page=${page}`);
      
      for (const movieData of popularData.results) {
        try {
          const details = await tmdb(`/movie/${movieData.id}?language=es-MX`);
          const keywordsData = await tmdb(`/movie/${movieData.id}/keywords`);

          const movieDoc = {
            tmdbId: details.id,
            title: details.title,
            year: details.release_date ? new Date(details.release_date).getFullYear() : null,
            genres: details.genres ? details.genres.map(g => g.name) : [],
            keywords: keywordsData.keywords ? keywordsData.keywords.map(k => k.name) : [],
            poster: details.poster_path,
            runtime: details.runtime,
            overview: details.overview,
            popularity: details.popularity || 0,
          };

          await Movie.findOneAndUpdate(
            { tmdbId: movieDoc.tmdbId },
            movieDoc,
            { upsert: true, new: true }
          );

          totalMovies++;
          console.log(`  ✓ ${movieDoc.title} (${movieDoc.year})`);
        } catch (error) {
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      message: 'Seed completado',
      totalMovies,
      pages: PAGES,
    });

  } catch (error) {
    console.error('Error en seed:', error);
    return NextResponse.json(
      { error: 'Error en seed' },
      { status: 500 }
    );
  }
}
