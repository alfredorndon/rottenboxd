/**
 * Smoke Tests Script
 * Pruebas básicas de funcionalidad
 * 
 * Uso: npm run smoke
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
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
  email: { type: String, unique: true },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true },
  title: String,
  year: Number,
  genres: [String],
  keywords: [String],
  poster: String,
});

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  rating: Number,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);

async function runSmokeTests() {
  try {
    console.log('🧪 Iniciando smoke tests...\n');

    // Test 1: Conexión a MongoDB
    console.log('📦 Test 1: Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado correctamente\n');

    // Test 2: Verificar colecciones
    console.log('📋 Test 2: Verificando colecciones...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`✅ Colecciones encontradas: ${collectionNames.join(', ')}\n`);

    // Test 3: Contar películas
    console.log('🎬 Test 3: Contando películas...');
    const movieCount = await Movie.countDocuments();
    console.log(`✅ Total de películas: ${movieCount}`);
    
    if (movieCount === 0) {
      console.warn('⚠️  No hay películas. Ejecuta: npm run seed\n');
    } else {
      // Mostrar algunas películas
      const sampleMovies = await Movie.find().limit(5);
      console.log('\nPelículas de muestra:');
      sampleMovies.forEach(m => {
        console.log(`  - ${m.title} (${m.year})`);
      });
      console.log();
    }

    // Test 4: Crear usuario de prueba
    console.log('👤 Test 4: Creando usuario de prueba...');
    const testEmail = 'test@rottenboxd.com';
    
    let testUser = await User.findOne({ email: testEmail });
    
    if (testUser) {
      console.log('✅ Usuario de prueba ya existe');
    } else {
      const passwordHash = await bcrypt.hash('test123', 10);
      testUser = await User.create({
        name: 'Usuario Test',
        email: testEmail,
        passwordHash,
      });
      console.log('✅ Usuario de prueba creado');
    }
    console.log(`   Email: ${testUser.email}`);
    console.log(`   ID: ${testUser._id}\n`);

    // Test 5: Verificar ratings
    console.log('⭐ Test 5: Verificando ratings...');
    const ratingCount = await Rating.countDocuments();
    console.log(`✅ Total de ratings: ${ratingCount}\n`);

    // Test 6: Búsqueda por texto
    if (movieCount > 0) {
      console.log('🔍 Test 6: Probando búsqueda por texto...');
      try {
        const searchResults = await Movie.find(
          { $text: { $search: 'action' } }
        ).limit(3);
        console.log(`✅ Búsqueda de texto funcional (${searchResults.length} resultados)\n`);
      } catch (error) {
        console.warn('⚠️  Índice de texto no disponible:', error.message);
        console.log('   Ejecuta: npm run seed (para crear índices)\n');
      }
    }

    // Resumen
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Todos los smoke tests completados');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Resumen:');
    console.log(`   - Películas: ${movieCount}`);
    console.log(`   - Ratings: ${ratingCount}`);
    console.log(`   - Usuarios: ${await User.countDocuments()}`);
    console.log('\n🚀 Sistema listo para usar!');
    console.log('   Inicia el servidor: npm run dev\n');

  } catch (error) {
    console.error('❌ Error en smoke tests:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB\n');
  }
}

// Ejecutar tests
runSmokeTests();

