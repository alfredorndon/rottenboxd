# 🚀 Guía de Instalación - rottenboxd

Esta guía te llevará paso a paso para configurar y ejecutar **rottenboxd** en tu máquina local.

---

## ✅ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (v18 o superior) - [Descargar aquí](https://nodejs.org/)
2. **npm** (viene con Node.js)
3. **MongoDB**
   - Opción A: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis, en la nube)
   - Opción B: MongoDB local
4. **Cuenta de TMDb** para obtener API key

---

## 📝 Paso 1: Obtener TMDb API Key

1. Ve a [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Crea una cuenta (gratis)
3. Ve a **Settings → API**
4. Solicita una API key (selecciona "Developer" o "Website")
5. **IMPORTANTE:** Necesitas el **"API Read Access Token (v4)"** (Bearer Token), NO la API Key v3

   Ejemplo:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...
   ```

---

## 🗄️ Paso 2: Configurar MongoDB

### Opción A: MongoDB Atlas (Recomendado - Gratis)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta
3. Crea un **Cluster gratuito** (M0)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", agrega tu IP o `0.0.0.0/0` (permitir todas las IPs en desarrollo)
6. Haz clic en **"Connect" → "Connect your application"**
7. Copia la **Connection String**, se verá así:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rottenboxd?retryWrites=true&w=majority
   ```
8. Reemplaza `<username>` y `<password>` con tus credenciales

### Opción B: MongoDB Local

Si tienes MongoDB instalado localmente:
```
MONGODB_URI=mongodb://localhost:27017/rottenboxd
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

1. En la raíz del proyecto, crea el archivo `.env.local`:
   ```bash
   touch .env.local
   ```

2. Abre `.env.local` con tu editor favorito y agrega:

   ```env
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://tuusuario:tucontraseña@cluster0.xxxxx.mongodb.net/rottenboxd?retryWrites=true&w=majority

   # TMDb API v4 Bearer Token
   TMDB_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # NextAuth Secret (genera uno random)
   NEXTAUTH_SECRET=tu-secreto-aleatorio-muy-largo-y-seguro-aqui
   NEXTAUTH_URL=http://localhost:3000

   # Environment
   NODE_ENV=development
   ```

3. **Genera un NEXTAUTH_SECRET seguro:**
   ```bash
   openssl rand -base64 32
   ```
   
   Pega el resultado en `NEXTAUTH_SECRET`.

---

## 📦 Paso 4: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- Next.js 15
- React 19
- NextAuth
- Mongoose
- bcryptjs
- Tailwind CSS
- Y más...

---

## 🌱 Paso 5: Poblar la Base de Datos

Ejecuta el script de seed para descargar películas de TMDb:

```bash
npm run seed
```

**¿Qué hace este comando?**
- Conecta a tu MongoDB
- Descarga 5 páginas de películas populares de TMDb (~100 películas)
- Obtiene detalles completos (géneros, keywords, poster, etc.)
- Crea índices optimizados para búsqueda
- Tarda aprox. 5-10 minutos por rate limiting de TMDb

**Salida esperada:**
```
🌱 Iniciando seed de TMDb...
📦 Conectando a MongoDB...
✅ MongoDB conectado

📄 Descargando página 1/5...
  ✓ The Shawshank Redemption (1994)
  ✓ The Godfather (1972)
  ...
✅ Página 1 completada

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed completado: 100 películas guardadas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Paso 6: Ejecutar Smoke Tests (Opcional)

Verifica que todo funcione correctamente:

```bash
npm run smoke
```

Este script verifica:
- ✅ Conexión a MongoDB
- ✅ Películas guardadas
- ✅ Índices creados
- ✅ Crea un usuario de prueba
- ✅ Prueba búsqueda de texto

---

## 🚀 Paso 7: Iniciar el Servidor

```bash
npm run dev
```

**Salida esperada:**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.3s
```

---

## 🎬 Paso 8: Usar la Aplicación

### 8.1 Abrir en el navegador

Ve a **http://localhost:3000**

### 8.2 Crear una cuenta

1. Haz clic en **"Registrarse"**
2. Completa el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: mínimo 6 caracteres
3. Haz clic en **"Crear Cuenta"**

### 8.3 Explorar películas

- En la página principal verás películas populares
- Usa el **buscador** en la navbar para encontrar películas específicas
- Haz clic en cualquier película para ver sus detalles

### 8.4 Calificar películas

1. En la página de detalle de una película, verás **"Tu Calificación"**
2. Haz clic en las estrellas (1-5) para calificar
3. Tu calificación se guarda automáticamente

### 8.5 Ver recomendaciones personalizadas

1. **Califica al menos 3-5 películas con 4-5 estrellas**
2. Ve a tu **Perfil** (en la navbar)
3. Verás dos secciones:
   - **"Recomendaciones para ti"** - películas sugeridas basadas en tus gustos
   - **"Tus Calificaciones"** - películas que has calificado

**💡 Nota:** El sistema necesita al menos 3 ratings con 4+ estrellas para generar recomendaciones personalizadas. Antes de eso, verás películas populares.

---

## 🎨 Funcionalidades Principales

### ✨ Autenticación
- Registro de usuarios
- Login/Logout
- Sesión persistente con JWT

### 🎥 Catálogo de Películas
- Películas de TMDb con posters
- Búsqueda por título
- Filtros por género
- Detalles completos (sinopsis, duración, keywords)

### ⭐ Sistema de Calificación
- Califica películas de 1 a 5 estrellas
- Actualiza o cambia tu calificación en cualquier momento
- Historial de calificaciones en tu perfil

### 🤖 Recomendaciones Inteligentes
- **Cold Start:** Películas populares para nuevos usuarios
- **Content-Based:** Recomendaciones basadas en géneros y keywords de tus películas favoritas
- Actualización en tiempo real

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Crea build optimizado
npm run start        # Inicia servidor de producción

# Utilidades
npm run seed         # Poblar BD con películas
npm run smoke        # Pruebas básicas
npm run lint         # Verificar código con ESLint
```

---

## 🐛 Solución de Problemas

### Error: "MONGODB_URI no configurada"
**Solución:** Verifica que `.env.local` existe y tiene `MONGODB_URI` correctamente configurada.

### Error: "TMDb API error: 401"
**Solución:** Tu `TMDB_API_KEY` es incorrecta o es la API Key v3 en lugar del Bearer Token v4.
- Ve a TMDb → Settings → API
- Copia el **"API Read Access Token (v4)"** (el largo que empieza con `eyJ...`)

### Error: "MongoServerError: bad auth"
**Solución:** Usuario o contraseña incorrectos en `MONGODB_URI`.
- Verifica tus credenciales en MongoDB Atlas
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### No aparecen películas
**Solución:** Ejecuta el seed:
```bash
npm run seed
```

### No hay recomendaciones personalizadas
**Solución:** Califica al menos 3 películas con 4-5 estrellas, luego recarga la página de perfil.

### Error: "Cannot find module '@/...' "
**Solución:** Ejecuta:
```bash
npm install
```

### Seed muy lento o falla
**Solución:** TMDb tiene rate limiting. Si falla:
1. Espera 5-10 minutos
2. Reintenta: `npm run seed`
3. Si persiste, verifica que `TMDB_API_KEY` sea correcta

---

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [TMDb API Docs](https://developers.themoviedb.org/3)
- [NextAuth.js Docs](https://next-auth.js.org/)

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, ahora deberías tener **rottenboxd** funcionando en tu máquina.

**Próximos pasos:**
1. Explora películas
2. Califica tus favoritas
3. Descubre recomendaciones personalizadas
4. ¡Disfruta! 🍿

---

**¿Problemas?** Revisa la sección de **Solución de Problemas** arriba o consulta el `README.md` para más detalles técnicos.

