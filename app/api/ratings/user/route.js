/**
 * User Ratings API
 * GET /api/ratings/user
 * Obtiene todas las calificaciones del usuario actual
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import { toObjectId } from '@/lib/utils';
import Rating from '@/models/Rating';

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

    // Convertir userId string a ObjectId de forma segura
    const userId = toObjectId(session.user.id);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    // Obtener ratings del usuario con populate de movieId
    const ratings = await Rating.find({ userId: userId })
      .populate('movieId')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      ratings,
      count: ratings.length,
    });
  } catch (error) {
    console.error('Error al obtener ratings del usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener ratings' },
      { status: 500 }
    );
  }
}

