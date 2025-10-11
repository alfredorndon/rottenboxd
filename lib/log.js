/**
 * Logger Helper
 * Funciones simples para logging con formato
 */

export function logInfo(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[INFO ${timestamp}] ${message}`);
  if (data) console.log(data);
}

export function logError(message, error = null) {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR ${timestamp}] ${message}`);
  if (error) console.error(error);
}

export function logWarning(message, data = null) {
  const timestamp = new Date().toISOString();
  console.warn(`[WARN ${timestamp}] ${message}`);
  if (data) console.warn(data);
}

export function logSuccess(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[SUCCESS ${timestamp}] ${message}`);
  if (data) console.log(data);
}

