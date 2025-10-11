/**
 * Clean Database Script
 * Limpia todas las colecciones de la base de datos
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar path para .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Falta variable de entorno: MONGODB_URI');
  process.exit(1);
}

// Schemas inline
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
});

const movieSchema = new mongoose.Schema({
  tmdbId: Number,
  title: String,
  year: Number,
  genres: [String],
  keywords: [String],
  poster: String,
  runtime: Number,
  overview: String,
  popularity: Number,
  voteAverage: Number,
  releaseDate: Date,
});

const ratingSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  movieId: mongoose.Schema.Types.ObjectId,
  rating: Number,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);

async function cleanDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...\n');

    // Conectar a MongoDB
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    // Limpiar colecciones
    console.log('🗑️  Limpiando colecciones...');
    
    const movieResult = await Movie.deleteMany({});
    console.log(`✅ Películas eliminadas: ${movieResult.deletedCount}`);
    
    const ratingResult = await Rating.deleteMany({});
    console.log(`✅ Ratings eliminados: ${ratingResult.deletedCount}`);
    
    const userResult = await User.deleteMany({});
    console.log(`✅ Usuarios eliminados: ${userResult.deletedCount}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Base de datos limpiada exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error al limpiar base de datos:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB\n');
  }
}

// Ejecutar limpieza
cleanDatabase();
