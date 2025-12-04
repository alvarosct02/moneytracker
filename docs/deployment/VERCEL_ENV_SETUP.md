# Configurar Variables de Entorno en Vercel

## Pasos Rápidos

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto **MoneyTracker**
3. Ve a **Settings** > **Environment Variables**
4. Agrega las siguientes variables:

### Variable Principal (Requerida)

**Nombre:** `POSTGRES_URL`  
**Valor:** `postgresql://neondb_owner:npg_Fuhv5WEzD7IY@ep-divine-art-a46sz2tz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`  
**Environment:** Production, Preview, Development (marca las tres)

### Variable Alternativa (Opcional)

Si prefieres usar `DATABASE_URL` en lugar de `POSTGRES_URL`:

**Nombre:** `DATABASE_URL`  
**Valor:** `postgresql://neondb_owner:npg_Fuhv5WEzD7IY@ep-divine-art-a46sz2tz-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`  
**Environment:** Production, Preview, Development (marca las tres)

## Notas Importantes

- ✅ Usa la versión **pooled** (`-pooler` en la URL) para la mayoría de casos
- ✅ Marca **todas las environments** (Production, Preview, Development) para que funcione en todos los entornos
- ✅ Después de agregar las variables, Vercel redesplegará automáticamente
- ✅ El código detecta automáticamente `POSTGRES_URL` o `DATABASE_URL`

## Verificación

Después de configurar y redesplegar:

1. Ve a **Deployments** y espera a que termine el nuevo deploy
2. Prueba crear un gasto en la aplicación
3. Espera unos minutos y recarga la página
4. El gasto debería persistir (ya no se borrará cuando el servidor se "duerma")

## Seguridad

⚠️ **IMPORTANTE:** Las credenciales mostradas arriba son de ejemplo. Usa las credenciales reales que Neon te proporcionó.

