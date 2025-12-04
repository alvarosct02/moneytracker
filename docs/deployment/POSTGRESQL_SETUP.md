# Configuración de PostgreSQL en Vercel

## Problema Actual

Los gastos se borran cuando el servidor se "duerme" porque SQLite está usando `/tmp` que es efímero en Vercel.

## Solución: PostgreSQL

El código ahora soporta PostgreSQL automáticamente. Si detecta la variable de entorno `POSTGRES_URL` o `DATABASE_URL`, usará PostgreSQL. Si no, usará SQLite como fallback.

## Pasos para Configurar PostgreSQL en Vercel

### 1. Crear Base de Datos PostgreSQL en Vercel

**Recomendación: Usar Neon (Serverless Postgres)**

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Ve a la pestaña **Storage**
3. Haz clic en **Create Database**
4. En la sección **Marketplace Database Providers**, busca **Neon** (tiene un logo verde con "N")
5. Haz clic en **Create** en la tarjeta de Neon
6. Sigue el proceso de configuración:
   - Elige un nombre para tu base de datos
   - Selecciona una región cercana a ti
   - El plan gratuito es suficiente para empezar
7. Neon se conectará automáticamente a tu proyecto y configurará la variable `POSTGRES_URL`

**Alternativas:**
- **Supabase**: También es una buena opción con plan gratuito generoso
- **Prisma Postgres**: Si prefieres una solución más integrada con Prisma

### 2. Verificar Conexión Automática

1. Una vez creada la base de datos con Neon, Vercel automáticamente:
   - Conectará la base de datos a tu proyecto
   - Creará la variable de entorno `POSTGRES_URL` con la cadena de conexión
   - Redesplegará tu proyecto automáticamente

2. Puedes verificar las variables de entorno en **Settings** > **Environment Variables**
3. Deberías ver `POSTGRES_URL` configurada automáticamente

### 3. Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas en Vercel:

- `POSTGRES_URL` o `DATABASE_URL` - Cadena de conexión a PostgreSQL

### 4. Redesplegar

Después de configurar las variables de entorno, Vercel debería redespelgar automáticamente. Si no, puedes:

1. Ir a **Deployments**
2. Hacer clic en los tres puntos del último deployment
3. Seleccionar **Redeploy**

## Verificación

Una vez desplegado, los gastos deberían persistir incluso cuando el servidor se "duerme". Puedes verificar:

1. Crear un gasto
2. Esperar unos minutos (para que el servidor se "duerma")
3. Recargar la página
4. El gasto debería seguir ahí

## Notas

- El código detecta automáticamente si PostgreSQL está disponible
- Si PostgreSQL no está configurado, usará SQLite como fallback (pero los datos se perderán en `/tmp`)
- La migración del esquema se ejecuta automáticamente la primera vez que se conecta a PostgreSQL

