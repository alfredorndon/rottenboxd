/**
 * User Registration API
 * POST /api/auth/register
 * Body: { name, email, password }
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { createUser } from '@/lib/user';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password } = body;

    // Validar input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Crear usuario
    const user = await createUser({ name, email, password });

    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);

    // Error de email duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}

