# Probar Localmente con PostgreSQL (Neon)

## Configuración Rápida

### 1. Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo `.env.local` con tu conexión de Neon:

```bash
POSTGRES_URL=postgresql://neondb_owner:npg_Fuhv5WEzD7IY@ep-divine-art-a46sz2tz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Nota:** Usa tus propias credenciales de Neon. El archivo `.env.local` ya está en `.gitignore`, así que no se subirá a Git.

### 2. Iniciar el servidor local

```bash
# Desde la raíz del proyecto
cd api
npm run dev
```

El servidor debería iniciar en `http://localhost:3001` y mostrar:
- `✅ Loaded .env.local from project root` (si encuentra el archivo)
- `✅ Connected to PostgreSQL` (si se conecta correctamente)

### 3. Iniciar el frontend

En otra terminal:

```bash
# Desde la raíz del proyecto
cd frontend
npm run dev
```

El frontend debería iniciar en `http://localhost:5173` (o el puerto que Vite asigne).

## Verificación

### 1. Verificar conexión a PostgreSQL

El servidor debería mostrar en los logs:
```
🔌 Connecting to PostgreSQL...
✅ Connected to PostgreSQL
✅ PostgreSQL schema initialized
```

Si ves `🔌 Connecting to SQLite...` en su lugar, significa que no está leyendo las variables de entorno correctamente.

### 2. Probar crear un gasto

1. Abre `http://localhost:5173` en tu navegador
2. Crea un nuevo gasto
3. Verifica que aparece en la lista
4. Verifica que el resumen se actualiza correctamente

### 3. Verificar en Neon Dashboard

1. Ve a tu dashboard de Neon: https://console.neon.tech
2. Selecciona tu base de datos
3. Ve a la pestaña **SQL Editor**
4. Ejecuta: `SELECT * FROM expenses;`
5. Deberías ver los gastos que creaste

## Troubleshooting

### Error: "Cannot find module 'dotenv'"

```bash
cd api
npm install dotenv
```

### Error: "Connection refused" o "timeout"

- Verifica que la URL de conexión sea correcta
- Asegúrate de usar la versión **pooled** (`-pooler` en la URL)
- Verifica que `sslmode=require` esté en la URL

### El servidor usa SQLite en lugar de PostgreSQL

- Verifica que el archivo `.env.local` esté en la raíz del proyecto
- Verifica que la variable se llame `POSTGRES_URL` (no `DATABASE_URL` a menos que también la agregues)
- Verifica que no haya espacios o caracteres extraños en el archivo `.env.local`
- Reinicia el servidor después de crear/modificar `.env.local`

### Los datos no persisten

- Verifica que estés conectado a PostgreSQL (deberías ver el log `✅ Connected to PostgreSQL`)
- Verifica en el dashboard de Neon que los datos se estén guardando
- Si usas SQLite local, los datos estarán en `api/db/expenses.db`

## Notas

- El archivo `.env.local` está en `.gitignore`, así que no se subirá a Git
- Para producción en Vercel, configura las variables de entorno en el dashboard de Vercel
- La conexión pooled (`-pooler`) es mejor para desarrollo y producción
- La conexión unpooled es mejor para migraciones o operaciones largas

