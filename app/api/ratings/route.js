/**
 * Ratings API
 * POST /api/ratings - Crea o actualiza un rating
 * Body: { tmdbId, rating }
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import { toObjectId } from '@/lib/utils';
import Movie from '@/models/Movie';
import Rating from '@/models/Rating';

export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { tmdbId, rating } = body;

    // Validar input
    if (!tmdbId || rating === undefined) {
      return NextResponse.json(
        { error: 'tmdbId y rating son requeridos' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Buscar película por tmdbId
    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId) });

    if (!movie) {
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: 404 }
      );
    }

    // Convertir userId string a ObjectId de forma segura
    const userId = toObjectId(session.user.id);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Upsert rating (crear o actualizar)
    const updatedRating = await Rating.findOneAndUpdate(
      {
        userId: userId,
        movieId: movie._id,
      },
      {
        userId: userId,
        movieId: movie._id,
        rating,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json({
      message: 'Rating guardado exitosamente',
      rating: updatedRating,
    });
  } catch (error) {
    console.error('Error al guardar rating:', error);
    return NextResponse.json(
      { error: 'Error al guardar rating' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ratings?tmdbId=123
 * Obtiene el rating del usuario actual para una película
 */
export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdbId');

    if (!tmdbId) {
      return NextResponse.json(
        { error: 'tmdbId es requerido' },
        { status: 400 }
      );
    }

    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId) });

    if (!movie) {
      return NextResponse.json({ rating: null });
    }

    const userId = toObjectId(session.user.id);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }
    
    const rating = await Rating.findOne({
      userId: userId,
      movieId: movie._id,
    });

    return NextResponse.json({ rating });
  } catch (error) {
    console.error('Error al obtener rating:', error);
    return NextResponse.json(
      { error: 'Error al obtener rating' },
      { status: 500 }
    );
  }
}

