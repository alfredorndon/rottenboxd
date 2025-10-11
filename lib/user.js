/**
 * User Helper
 * Funciones para manejo de usuarios y contraseñas
 */

import bcrypt from 'bcryptjs';
import User from '@/models/User';

/**
 * Hash de contraseña con bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Crea un nuevo usuario
 * @param {object} userData - { name, email, password }
 * @returns {Promise<object>} - Usuario creado sin passwordHash
 */
export async function createUser({ name, email, password }) {
  // Validar longitud de contraseña
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Hash de contraseña
  const passwordHash = await hashPassword(password);

  // Crear usuario
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  // Retornar usuario sin passwordHash
  return {
    id: user._id.toString(), // Convertir ObjectId a string
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

/**
 * Encuentra un usuario por email (incluye passwordHash)
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
}

/**
 * Valida credenciales de usuario
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object|null>} - Usuario sin passwordHash si es válido
 */
export async function validateUserCredentials(email, password) {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }

  // Retornar usuario sin passwordHash
  return {
    id: user._id.toString(), // Convertir ObjectId a string para NextAuth
    name: user.name,
    email: user.email,
  };
}

