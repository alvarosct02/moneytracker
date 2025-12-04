# Checklist de Publicación - MoneyTracker

## ✅ Pre-Despliegue

- [x] Configuración de Vercel (`vercel.json`)
- [x] Build scripts configurados
- [x] `.gitignore` actualizado
- [x] README con instrucciones
- [x] Guía de despliegue (`DEPLOY.md`)

## 📋 Pasos para Publicar

### 1. Inicializar Git (si no está inicializado)

```bash
cd /Users/alvarosantacruz/projects/MoneyTracker
git init
git add .
git commit -m "Initial commit: MoneyTracker MVP"
```

### 2. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en "New repository"
3. Nombre: `MoneyTracker` (o el que prefieras)
4. **NO** inicialices con README, .gitignore o licencia
5. Click en "Create repository"

### 3. Conectar y Subir Código

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/MoneyTracker.git
git push -u origin main
```

### 4. Desplegar en Vercel

#### Opción A: Desde el Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión (puedes usar GitHub)
3. Click en "Add New Project"
4. Selecciona tu repositorio `MoneyTracker`
5. Vercel detectará automáticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm run install:all`
6. **No necesitas cambiar nada**, solo click en "Deploy"
7. Espera 2-3 minutos para que termine el build
8. Tu app estará en `https://tu-proyecto.vercel.app`

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar (primera vez)
vercel

# Desplegar a producción
vercel --prod
```

## 🔍 Verificación Post-Despliegue

1. **Frontend carga**: Verifica que la página principal se vea
2. **Crear gasto**: Prueba crear un nuevo gasto
3. **Filtros**: Verifica que los filtros funcionen
4. **Resumen**: Verifica que el resumen muestre los totales
5. **Logs**: Revisa los logs en Vercel Dashboard si hay errores

## ⚠️ Notas Importantes

### Base de Datos SQLite

- Los datos se guardan en `/tmp/expenses.db` en Vercel
- Los datos pueden perderse en cold starts (cuando la función se "duerme")
- Para producción real, considera migrar a PostgreSQL más adelante

### Si hay Errores en el Build

1. Revisa los logs en Vercel Dashboard
2. Verifica que `installCommand` sea `npm run install:all`
3. Asegúrate de que todos los `package.json` estén correctos
4. Verifica que no haya errores de TypeScript

## 🚀 Listo para Producción

Una vez desplegado, tu aplicación estará disponible públicamente y podrás:
- Acceder desde cualquier dispositivo
- Compartir el link con tu familia
- Usar la app en tu día a día

¡Felicitaciones! 🎉

