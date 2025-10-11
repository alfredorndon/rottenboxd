/**
 * User Model
 * Almacena información de usuarios con contraseñas hasheadas
 */

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
  },
  passwordHash: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    select: false, // No incluir por defecto en queries
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice único en email para búsquedas rápidas
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

