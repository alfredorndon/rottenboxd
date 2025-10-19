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
    const limit = parseInt(searchParams.get('limit')) || 25;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    let movies = [];

    if (query) {
      // Verificar si query es un número (tmdbId)
      if (!isNaN(query)) {
        const tmdbId = parseInt(query);
        movies = await Movie.find({ tmdbId }).skip(skip).limit(limit);
      } else {
        // Búsqueda por texto usando índice text
        try {
          movies = await Movie.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
          )
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit);
        } catch (error) {
          // Fallback a regex si falla búsqueda de texto
          movies = await Movie.find({
            title: { $regex: query, $options: 'i' },
          }).skip(skip).limit(limit);
        }
      }
    } else if (genre) {
      // Filtrar por género
      movies = await Movie.find({
        genres: genre,
      })
        .sort({ popularity: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      // Sin filtros: retornar películas populares
      movies = await Movie.find({
        poster: { $exists: true, $ne: null },
      })
        .sort({ popularity: -1, year: -1 })
        .skip(skip)
        .limit(limit);
    }

    // Contar total para paginación
    let totalCount = 0;
    if (query && !isNaN(query)) {
      totalCount = await Movie.countDocuments({ tmdbId: parseInt(query) });
    } else if (query) {
      try {
        totalCount = await Movie.countDocuments({ $text: { $search: query } });
      } catch {
        totalCount = await Movie.countDocuments({ title: { $regex: query, $options: 'i' } });
      }
    } else if (genre) {
      totalCount = await Movie.countDocuments({ genres: genre });
    } else {
      totalCount = await Movie.countDocuments({ poster: { $exists: true, $ne: null } });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error al buscar películas:', error);
    return NextResponse.json(
      { error: 'Error al buscar películas' },
      { status: 500 }
    );
  }
}

