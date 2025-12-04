# Configuración de PostgreSQL en Vercel

## Problema Actual

Los gastos se borran cuando el servidor se "duerme" porque SQLite está usando `/tmp` que es efímero en Vercel.

## Solución: PostgreSQL

El código ahora soporta PostgreSQL automáticamente. Si detecta la variable de entorno `POSTGRES_URL` o `DATABASE_URL`, usará PostgreSQL. Si no, usará SQLite como fallback.

## Pasos para Configurar PostgreSQL en Vercel

### 1. Crear Base de Datos PostgreSQL en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Ve a la pestaña **Storage**
3. Haz clic en **Create Database**
4. Selecciona **Postgres**
5. Elige un plan (el plan gratuito "Hobby" es suficiente para empezar)
6. Selecciona una región cercana a ti
7. Haz clic en **Create**

### 2. Conectar la Base de Datos al Proyecto

1. Una vez creada la base de datos, haz clic en **.env.local** o ve a **Settings** > **Environment Variables**
2. Vercel automáticamente creará la variable `POSTGRES_URL` con la cadena de conexión
3. Si no aparece automáticamente, copia la **Connection String** de la base de datos y créala manualmente como `POSTGRES_URL`

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

