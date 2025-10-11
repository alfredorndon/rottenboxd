/**
 * Recommendations API
 * GET /api/recommendations?limit=20
 * Genera recomendaciones personalizadas usando sistema híbrido
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { getHybridRecommendations, getRecommendationType } from '@/lib/reco/hybrid';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Convertir userId string a ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Obtener recomendaciones híbridas
    const recommendations = await getHybridRecommendations(userId, limit);
    
    // Obtener tipo de recomendación
    const recommendationType = await getRecommendationType(userId);

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      type: recommendationType,
      message: recommendationType === 'cold-start' 
        ? 'Califica más películas para obtener recomendaciones personalizadas'
        : 'Recomendaciones basadas en tus gustos',
    });
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener recomendaciones' },
      { status: 500 }
    );
  }
}

