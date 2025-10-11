/**
 * Movie Model
 * Almacena películas obtenidas de TMDb con índices optimizados
 * para búsqueda por texto y géneros
 */

import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
  },
  genres: {
    type: [String],
    default: [],
  },
  keywords: {
    type: [String],
    default: [],
  },
  poster: {
    type: String, // URL completa de TMDb
  },
  runtime: {
    type: Number, // minutos
  },
  overview: {
    type: String,
  },
  // Solo agregamos popularity para el algoritmo de cold-start
  popularity: {
    type: Number,
    default: 0,
  },
});

// Índices optimizados
MovieSchema.index({ tmdbId: 1 }, { unique: true });
MovieSchema.index({ genres: 1 }); // Para filtrar por género
MovieSchema.index({ year: -1 }); // Para ordenar por año
MovieSchema.index({ popularity: -1 }); // Para ordenar por popularidad

// Índice de texto para búsqueda full-text
// Mayor peso a title para priorizar coincidencias en título
MovieSchema.index(
  { title: 'text', keywords: 'text' },
  { 
    weights: { 
      title: 10, 
      keywords: 5 
    },
    name: 'movie_text_index'
  }
);

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

