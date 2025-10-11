/**
 * Movie Detail API
 * GET /api/movies/[tmdbId]
 * Obtiene detalles de una película por su tmdbId
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Movie from '@/models/Movie';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const tmdbId = parseInt(params.tmdbId);

    if (isNaN(tmdbId)) {
      return NextResponse.json(
        { error: 'tmdbId inválido' },
        { status: 400 }
      );
    }

    const movie = await Movie.findOne({ tmdbId });

    if (!movie) {
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Error al obtener película:', error);
    return NextResponse.json(
      { error: 'Error al obtener película' },
      { status: 500 }
    );
  }
}

