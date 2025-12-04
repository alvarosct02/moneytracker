# Guía de Despliegue - MoneyTracker

## Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Preparar el repositorio**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MoneyTracker MVP"
   git branch -M main
   git remote add origin <tu-repositorio-github>
   git push -u origin main
   ```

2. **Conectar a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Click en "Add New Project"
   - Selecciona tu repositorio `MoneyTracker`
   - Vercel detectará automáticamente la configuración desde `vercel.json`

3. **Configuración automática**
   - Vercel detectará:
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `frontend/dist`
     - Install Command: `npm run install:all`

4. **Desplegar**
   - Click en "Deploy"
   - Espera a que termine el build
   - Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Opción 2: Desde CLI de Vercel

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión**
   ```bash
   vercel login
   ```

3. **Desplegar**
   ```bash
   vercel
   ```

4. **Para producción**
   ```bash
   vercel --prod
   ```

## Configuración del Proyecto

### Variables de Entorno

No se requieren variables de entorno para el MVP actual. La base de datos SQLite se crea automáticamente en `/tmp` en Vercel.

### Estructura de Despliegue

- **Frontend**: Se construye con Vite y se sirve desde `frontend/dist`
- **Backend**: Las funciones serverless en `api/` se exponen en `/api/*`
- **Base de datos**: SQLite se crea en `/tmp/expenses.db` (persistente durante el ciclo de vida de la función)

## Notas Importantes

### Limitaciones de SQLite en Vercel

- Los datos se almacenan en `/tmp` que es persistente durante el ciclo de vida de la función
- Los datos pueden perderse si la función se "duerme" (cold start)
- Para producción real, considera migrar a PostgreSQL más adelante

### Optimizaciones para Producción

1. **Base de datos**: Considera usar Vercel Postgres o una base de datos externa
2. **Caching**: Agrega headers de cache para assets estáticos
3. **Analytics**: Considera agregar Vercel Analytics

## Verificación Post-Despliegue

1. Verifica que el frontend carga correctamente
2. Prueba crear un gasto
3. Verifica que los filtros funcionan
4. Revisa los logs en Vercel Dashboard si hay errores

## Troubleshooting

### Error: "Module not found"
- Verifica que `installCommand` esté configurado como `npm run install:all`
- Asegúrate de que todos los `package.json` tengan las dependencias correctas

### Error: "Function timeout"
- Las funciones serverless tienen un timeout de 10s (hobby) o 60s (pro)
- Verifica que las queries a la base de datos sean eficientes

### Error: "Database locked"
- SQLite puede tener problemas de concurrencia
- Considera usar una base de datos externa para producción

## Próximos Pasos

1. ✅ Desplegar en Vercel
2. 🔄 Migrar a PostgreSQL (cuando sea necesario)
3. 🔄 Agregar autenticación (si se necesita)
4. 🔄 Implementar categorías personalizadas
5. 🔄 Agregar reportes y analytics

