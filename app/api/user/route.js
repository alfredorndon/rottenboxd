/**
 * User Profile API
 * GET /api/user - Obtiene datos del usuario actual
 * PUT /api/user - Actualiza datos del usuario
 * DELETE /api/user - Elimina la cuenta del usuario
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Rating from '@/models/Rating';
import { hashPassword } from '@/lib/user';

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

    // Obtener datos del usuario (sin passwordHash)
    const user = await User.findOne({ email: session.user.email }).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    // Buscar usuario actual
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData = {};

    // Actualizar nombre si se proporciona
    if (name && name.trim() !== '') {
      updateData.name = name.trim();
    }

    // Actualizar contraseña si se proporciona
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }

      // Verificar contraseña actual si se proporciona
      if (currentPassword) {
        const bcrypt = await import('bcryptjs');
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        
        if (!isValidPassword) {
          return NextResponse.json(
            { error: 'La contraseña actual es incorrecta' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Debes proporcionar la contraseña actual para cambiarla' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    ).select('-passwordHash');

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Buscar usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar todos los ratings del usuario
    await Rating.deleteMany({ userId: user._id });

    // Eliminar el usuario
    await User.findByIdAndDelete(user._id);

    return NextResponse.json({
      message: 'Cuenta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cuenta' },
      { status: 500 }
    );
  }
}
