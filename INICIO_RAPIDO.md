# ⚡ Inicio Rápido - rottenboxd

## 🎯 Pasos Mínimos para Ejecutar

### 1️⃣ Crear `.env.local`

```bash
# Copia este contenido en .env.local y reemplaza con tus datos reales

MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/rottenboxd?retryWrites=true&w=majority
TMDB_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=tu-secreto-aleatorio-muy-largo-y-seguro-aqui
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Obtener credenciales:**
- **MongoDB:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)
- **TMDb:** [TMDb API](https://www.themoviedb.org/settings/api) → "API Read Access Token (v4)"
- **NEXTAUTH_SECRET:** Ejecuta `openssl rand -base64 32`

---

### 2️⃣ Instalar

```bash
npm install
```

---

### 3️⃣ Poblar Base de Datos

```bash
npm run seed
```

⏱️ Tarda ~5-10 minutos. Descarga 100 películas de TMDb.

---

### 4️⃣ Iniciar

```bash
npm run dev
```

🌐 Abre **http://localhost:3000**

---

## 🎬 Primeros Pasos en la App

1. **Registrarse:** Clic en "Registrarse" → Completa formulario
2. **Explorar:** Navega por las películas populares
3. **Calificar:** Clic en una película → Califica con estrellas (1-5)
4. **Recomendar:** Califica 3-5 películas con 4-5★
5. **Perfil:** Ve a "Perfil" para ver recomendaciones personalizadas

---

## 🧪 Verificación (Opcional)

```bash
npm run smoke
```

Verifica que todo funcione correctamente.

---

## 📚 Más Información

- **Documentación completa:** Ver `README.md`
- **Guía detallada:** Ver `INSTALACION.md`
- **Archivos creados:** Ver `ARCHIVOS_CREADOS.md`

---

## 🆘 Ayuda Rápida

### No aparecen películas
```bash
npm run seed
```

### Error de MongoDB
Verifica que `MONGODB_URI` en `.env.local` sea correcta.

### Error de TMDb (401)
Verifica que `TMDB_API_KEY` sea el **Bearer Token v4** (no API Key v3).

### No hay recomendaciones personalizadas
Califica al menos 3 películas con 4-5★ y recarga `/profile`.

---

**¡Eso es todo! 🎉 Disfruta rottenboxd 🍿**

