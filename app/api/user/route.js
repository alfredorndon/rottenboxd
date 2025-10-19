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
import bcrypt from 'bcryptjs';

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
    console.log('PUT /api/user - Iniciando...');
    
    const session = await getServerSession();
    
    if (!session || !session.user) {
      console.log('Error: No autenticado');
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    console.log('Datos recibidos:', { 
      name: body.name, 
      hasCurrentPassword: !!body.currentPassword, 
      hasNewPassword: !!body.newPassword 
    });
    
    const { name, currentPassword, newPassword } = body;

    // Buscar usuario actual
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log('Usuario no encontrado');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('Usuario encontrado:', user.email);

    // Preparar datos de actualización
    const updateData = {};

    // Actualizar nombre si se proporciona
    if (name && name.trim() !== '') {
      updateData.name = name.trim();
      console.log('Actualizando nombre a:', updateData.name);
    }

    // Actualizar contraseña si se proporciona
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }

      // Verificar contraseña actual
      if (currentPassword) {
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        
        if (!isValidPassword) {
          console.log('Contraseña actual incorrecta');
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

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
      console.log('Contraseña actualizada');
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }

    console.log('Actualizando con datos:', Object.keys(updateData));

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      console.log('Error: Usuario no se pudo actualizar');
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    console.log('Usuario actualizado exitosamente');

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
    console.error('Error detallado:', error);
    return NextResponse.json(
      { error: `Error al actualizar perfil: ${error.message}` },
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