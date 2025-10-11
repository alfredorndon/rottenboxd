/**
 * Movies API
 * GET /api/movies?query=&genre=&limit=
 * Busca películas por query o género
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Movie from '@/models/Movie';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const genre = searchParams.get('genre');
    const limit = parseInt(searchParams.get('limit')) || 40;

    let movies = [];

    if (query) {
      // Verificar si query es un número (tmdbId)
      if (!isNaN(query)) {
        const tmdbId = parseInt(query);
        movies = await Movie.find({ tmdbId }).limit(limit);
      } else {
        // Búsqueda por texto usando índice text
        try {
          movies = await Movie.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
          )
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit);
        } catch (error) {
          // Fallback a regex si falla búsqueda de texto
          movies = await Movie.find({
            title: { $regex: query, $options: 'i' },
          }).limit(limit);
        }
      }
    } else if (genre) {
      // Filtrar por género
      movies = await Movie.find({
        genres: genre,
      })
        .sort({ popularity: -1 })
        .limit(limit);
    } else {
      // Sin filtros: retornar películas populares
      movies = await Movie.find({
        poster: { $exists: true, $ne: null },
      })
        .sort({ popularity: -1, year: -1 })
        .limit(limit);
    }

    return NextResponse.json({
      movies,
      count: movies.length,
    });
  } catch (error) {
    console.error('Error al buscar películas:', error);
    return NextResponse.json(
      { error: 'Error al buscar películas' },
      { status: 500 }
    );
  }
}

