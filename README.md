# 🎬 rottenboxd

Un clon minimalista de Letterboxd construido con Next.js, React, MongoDB y TMDb API. Descubre películas, califica tus favoritas y obtén recomendaciones personalizadas basadas en tus gustos.

## ✨ Características

- 🔐 **Autenticación completa** con NextAuth (Credentials Provider + bcrypt)
- 🎥 **Catálogo de películas** obtenido de TMDb API
- ⭐ **Sistema de calificación** (1-5 estrellas)
- 🤖 **Recomendaciones personalizadas** usando content-based filtering
- 🔍 **Búsqueda avanzada** con índices de texto optimizados
- 🌙 **Tema oscuro** tipo Letterboxd (fondo oscuro, acentos verdes)
- 📱 **Diseño responsive** y accesible

## 🛠️ Stack Tecnológico

- **Frontend:** React (JavaScript, no TypeScript)
- **Framework:** Next.js 15 con App Router
- **Estilos:** Tailwind CSS
- **Base de datos:** MongoDB con Mongoose
- **Autenticación:** NextAuth con JWT
- **API externa:** TMDb API v4 (Bearer Token)
- **Hashing:** bcryptjs

## 📋 Requisitos Previos

- Node.js 18+ y npm
- MongoDB (Atlas o local)
- Cuenta de TMDb API (https://www.themoviedb.org/settings/api)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd rottenboxd
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# TMDb API v4 Bearer Token (NO API Key v3)
TMDB_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration
NEXTAUTH_SECRET=<genera_un_string_aleatorio_largo>
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

**Nota importante:** El `TMDB_API_KEY` debe ser el **Bearer Token v4**, no la API Key v3. Lo encuentras en tu cuenta de TMDb → Settings → API → API Read Access Token.

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Poblar la base de datos

El script de seed descarga películas populares de TMDb:

```bash
npm run seed
```

Esto:
- Descarga 5 páginas de películas populares (~100 películas)
- Obtiene detalles completos y keywords de cada una
- Crea índices optimizados para búsqueda

⏱️ Tarda aproximadamente 5-10 minutos (rate limiting de TMDb).

### 5. Ejecutar pruebas básicas (opcional)

```bash
npm run smoke
```

Verifica:
- Conexión a MongoDB
- Películas guardadas
- Índices creados
- Usuario de prueba

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📖 Uso

### Primera vez

1. Ve a **http://localhost:3000**
2. Haz clic en **"Registrarse"**
3. Crea tu cuenta
4. Explora películas en la página principal
5. Haz clic en una película para ver detalles
6. **Califica al menos 3-5 películas con 4-5 estrellas** 
7. Ve a tu **Perfil** para ver recomendaciones personalizadas

### Sistema de recomendaciones

- **Cold Start:** Si tienes menos de 3 ratings con ≥4★, recibirás películas populares recientes
- **Content-Based:** Con 3+ ratings altos, el sistema analiza géneros y keywords de tus películas favoritas para recomendar similares
- Las recomendaciones se actualizan en tiempo real al calificar más películas

## 🏗️ Estructura del Proyecto

```
rottenboxd/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js    # NextAuth config
│   │   │   └── register/route.js         # Registro de usuarios
│   │   ├── movies/
│   │   │   ├── route.js                  # Lista/búsqueda de películas
│   │   │   └── [tmdbId]/route.js         # Detalle de película
│   │   ├── ratings/
│   │   │   ├── route.js                  # POST/GET ratings
│   │   │   └── user/route.js             # Ratings del usuario
│   │   └── recommendations/route.js      # Sistema de recomendaciones
│   ├── components/
│   │   ├── Button.jsx                    # Componente de botón
│   │   ├── Input.jsx                     # Campo de entrada
│   │   ├── MovieCard.jsx                 # Tarjeta de película
│   │   ├── StarRating.jsx                # Sistema de estrellas
│   │   ├── Navbar.jsx                    # Barra de navegación
│   │   ├── Footer.jsx                    # Pie de página
│   │   └── ClientSessionProvider.jsx     # Provider de sesión
│   ├── movie/[tmdbId]/page.jsx          # Página de detalle
│   ├── profile/page.jsx                  # Página de perfil
│   ├── login/page.jsx                    # Página de login
│   ├── signup/page.jsx                   # Página de registro
│   ├── layout.js                         # Layout principal
│   └── page.jsx                          # Home
├── lib/
│   ├── db.js                             # Conexión a MongoDB
│   ├── tmdb.js                           # Helper de TMDb API
│   ├── user.js                           # Funciones de usuario
│   ├── log.js                            # Logger
│   └── reco/
│       ├── contentBased.js               # Recomendaciones por contenido
│       └── hybrid.js                     # Sistema híbrido
├── models/
│   ├── User.js                           # Schema de Usuario
│   ├── Movie.js                          # Schema de Película
│   └── Rating.js                         # Schema de Rating
├── scripts/
│   ├── seed-tmdb.js                      # Script de seed
│   └── smoke-tests.js                    # Pruebas básicas
├── .env.local                            # Variables de entorno (NO COMMITEAR)
├── .env.example                          # Ejemplo de variables
├── package.json
└── README.md
```

## 🔍 Características Técnicas

### Modelos y Esquemas

#### User
- `name`, `email` (único), `passwordHash`
- Índice único en `email`
- Contraseñas hasheadas con bcryptjs

#### Movie
- `tmdbId` (único), `title`, `year`, `genres`, `keywords`, `poster`, etc.
- Índices: tmdbId, genres, year, popularity
- **Índice de texto** en `title` y `keywords` (peso 10:5)

#### Rating
- `userId` (ref User), `movieId` (ref Movie), `rating` (1-5)
- Índice compuesto único: `{userId, movieId}` (previene duplicados)
- Upsert automático al calificar

### Sistema de Recomendaciones

**Content-Based Filtering:**
1. Construye perfil de usuario con géneros/keywords de películas con rating ≥4
2. Puntúa candidatos por coincidencias (géneros x2, keywords x1)
3. Bonus por popularidad (factor pequeño)
4. Excluye películas ya calificadas

**Cold Start:**
- Películas populares y recientes (≥2015)
- Para usuarios con <3 ratings altos

### Autenticación

- NextAuth con **Credentials Provider**
- Sesión JWT (cookies HttpOnly)
- Callbacks para incluir `userId` en sesión
- Hash con bcrypt (salt rounds: 10)

### API de TMDb

- **Bearer Token v4** (no API Key v3)
- Rate limiting: 250ms entre requests
- Reintentos con backoff exponencial
- Lenguaje: español (es-MX)

## 🎨 Diseño UI

- **Tema oscuro:** Fondo `#0F0F0F`, texto gris claro
- **Acentos:** Verde esmeralda (`emerald-500/600`)
- **Tipografía:** Geist Sans (Next.js)
- **Grid responsive:** 2-6 columnas según viewport
- **Hover effects:** Elevación y sombras sutiles

## 🧪 Testing

```bash
# Smoke tests
npm run smoke

# Linting
npm run lint
```

## 📦 Scripts NPM

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run seed` - Poblar BD con películas de TMDb
- `npm run smoke` - Pruebas de humo
- `npm run lint` - ESLint

## 🚧 Troubleshooting

### Error: "MONGODB_URI no configurada"
→ Verifica que `.env.local` existe y tiene `MONGODB_URI`

### Error: "TMDb API error: 401"
→ Verifica que `TMDB_API_KEY` es el Bearer Token v4, no la API Key v3

### No hay recomendaciones personalizadas
→ Califica al menos 3 películas con 4-5 estrellas

### Películas sin poster
→ TMDb no tiene imagen. El script solo guarda películas con poster.

### Rate limit de TMDb
→ El script tiene delays (250ms), pero si falla, espera unos minutos y reintenta.

## 🔐 Seguridad

- ✅ Contraseñas hasheadas (nunca en texto plano)
- ✅ Cookies HttpOnly (sesión JWT)
- ✅ Validación de inputs
- ✅ Variables de entorno fuera de Git
- ✅ Sanitización de queries MongoDB

## 📄 Licencia

Proyecto educativo. 

**Atribución TMDb:** This product uses the TMDb API but is not endorsed or certified by TMDb.

## 🤝 Contribuciones

Este es un proyecto académico para demostración de conceptos de gestión de datos.

## 👨‍💻 Autor

Proyecto creado como parte del curso de Tópicos de Gestión de Datos.

---

**¡Disfruta explorando películas! 🍿**
