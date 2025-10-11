/**
 * Rating Model
 * Almacena calificaciones de usuarios a películas
 * Un usuario solo puede calificar una película una vez (upsert)
 */

import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    // En UI usaremos 1-5, pero el modelo soporta 0.5 pasos si es necesario
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Índices para consultas eficientes
RatingSchema.index({ userId: 1 }); // Buscar ratings por usuario
RatingSchema.index({ movieId: 1 }); // Buscar ratings por película
RatingSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // Evitar duplicados
RatingSchema.index({ rating: 1 }); // Para filtrar por rating alto/bajo
RatingSchema.index({ createdAt: -1 }); // Ordenar por fecha

// Actualizar updatedAt antes de guardar
RatingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

