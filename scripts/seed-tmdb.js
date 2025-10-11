/**
 * TMDb Seed Script
 * Pobla la base de datos con películas populares de TMDb
 * 
 * Uso: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar path para .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Importar después de configurar dotenv
const MONGODB_URI = process.env.MONGODB_URI;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!MONGODB_URI || !TMDB_API_KEY) {
  console.error('❌ Faltan variables de entorno: MONGODB_URI y/o TMDB_API_KEY');
  process.exit(1);
}

const BASE_URL = 'https://api.themoviedb.org/3';

// Helper para sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para hacer fetch a TMDb con reintentos
async function tmdbFetch(path, retries = 3) {
  const url = `${BASE_URL}${path}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt + 1) * 1000;
        console.warn(`⚠️  Rate limit, esperando ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(Math.pow(2, attempt) * 500);
    }
  }
}

// Schema de Movie (solo campos esenciales del prompt)
const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  year: Number,
  genres: [String],
  keywords: [String],
  poster: String,
  runtime: Number,
  overview: String,
  // Solo agregamos popularity para el algoritmo de cold-start
  popularity: { type: Number, default: 0 },
});

movieSchema.index({ tmdbId: 1 }, { unique: true });
movieSchema.index({ genres: 1 });
movieSchema.index({ year: -1 });
movieSchema.index({ popularity: -1 });
movieSchema.index(
  { title: 'text', keywords: 'text' },
  { weights: { title: 10, keywords: 5 }, name: 'movie_text_index' }
);

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

async function seedMovies() {
  try {
    console.log('🌱 Iniciando seed de TMDb...\n');

    // Conectar a MongoDB
    console.log('📦 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    let totalMovies = 0;
    const PAGES = 5; // Número de páginas a descargar (20 películas por página)

    for (let page = 1; page <= PAGES; page++) {
      console.log(`📄 Descargando página ${page}/${PAGES}...`);

      // Obtener películas populares
      const popularData = await tmdbFetch(`/movie/popular?language=es-MX&page=${page}`);
      
      for (const movieData of popularData.results) {
        try {
          console.log(`  Procesando: ${movieData.title}...`);

          // Obtener detalles completos
          const details = await tmdbFetch(`/movie/${movieData.id}?language=es-MX`);
          await sleep(250); // Rate limiting

          // Obtener keywords
          const keywordsData = await tmdbFetch(`/movie/${movieData.id}/keywords`);
          await sleep(250); // Rate limiting

          // Preparar datos (solo campos esenciales)
          const movieDoc = {
            tmdbId: details.id,
            title: details.title,
            year: details.release_date ? new Date(details.release_date).getFullYear() : null,
            genres: details.genres ? details.genres.map(g => g.name) : [],
            keywords: keywordsData.keywords ? keywordsData.keywords.map(k => k.name) : [],
            poster: details.poster_path,
            runtime: details.runtime,
            overview: details.overview,
            popularity: details.popularity || 0, // Solo para algoritmo de cold-start
          };

          // Upsert en MongoDB
          await Movie.findOneAndUpdate(
            { tmdbId: movieDoc.tmdbId },
            movieDoc,
            { upsert: true, new: true }
          );

          totalMovies++;
          console.log(`  ✓ ${movieDoc.title} (${movieDoc.year})`);
        } catch (error) {
          console.error(`  ✗ Error procesando ${movieData.title}:`, error.message);
        }
      }

      console.log(`✅ Página ${page} completada\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Seed completado: ${totalMovies} películas guardadas`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar índices
    console.log('🔍 Verificando índices...');
    const indexes = await Movie.collection.getIndexes();
    console.log('Índices creados:', Object.keys(indexes).join(', '));

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

// Ejecutar seed
seedMovies();

