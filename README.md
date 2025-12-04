# MoneyTracker MVP

Aplicación para llevar el registro de gastos diarios con categorías, subcategorías y owners.

## Estructura del Proyecto

- `frontend/` - Aplicación React + TypeScript + Vite
- `api/` - Backend con serverless functions para Vercel
- Monorepo desplegado en Vercel

## Desarrollo Local

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Instalar dependencias de root, frontend y backend
npm run install:all
```

O manualmente:

```bash
npm install
cd frontend && npm install
cd ../api && npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Esto iniciará:
- Frontend en `http://localhost:3000`
- Backend API en `http://localhost:3001` (proxied desde el frontend)

**Nota importante**: Asegúrate de que ambos servidores estén corriendo. El frontend hace proxy de las peticiones `/api/*` al backend en el puerto 3001.

Si ves errores "Error al cargar los gastos", verifica:
1. Que el servidor backend esté corriendo (`npm run dev:api` o `npm run dev`)
2. Revisa la consola del navegador (F12) para ver el error específico
3. Revisa los logs del servidor backend para ver errores de base de datos

### Build

```bash
npm run build
```

## Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repositorio>
   git push -u origin main
   ```

2. **Conecta a Vercel**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión
   - Click en "Add New Project"
   - Selecciona tu repositorio
   - Vercel detectará automáticamente la configuración

3. **Despliega**
   - Click en "Deploy"
   - Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Opción 2: Desde CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

**Nota**: Ver `docs/deployment/DEPLOY.md` para instrucciones detalladas.

## Funcionalidades

- ✅ Crear, editar y eliminar gastos
- ✅ Categorías y subcategorías predefinidas
- ✅ Filtros por categoría, subcategoría y owner
- ✅ Resumen de gastos del mes actual
- ✅ Diseño responsive y mobile-first

## Tecnologías

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express (serverless), TypeScript
- Base de datos: SQLite (better-sqlite3)

