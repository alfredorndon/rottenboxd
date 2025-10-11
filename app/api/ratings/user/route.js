/**
 * User Ratings API
 * GET /api/ratings/user
 * Obtiene todas las calificaciones del usuario actual
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';
import User from '@/models/User';

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

    // Obtener el usuario real de la BD para obtener su _id
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    const userId = user._id;

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

