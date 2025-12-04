# 🔑 Guía de Credenciales de Supabase

## El Problema Actual

Tienes una clave `sb_publishable_...` pero necesitas la clave `anon` (también llamada "anon public").

## Diferencia Entre las Claves

### sb_publishable_* (lo que tienes)
- **Nombre**: Publishable Key
- **Uso**: Para SDKs del lado del cliente en algunos casos específicos
- **Formato**: `sb_publishable_XXXXXXXXXX`
- **❌ NO funciona** para la API estándar de Supabase

### eyJ... (lo que necesitas)  
- **Nombre**: Anon Key / Anon Public
- **Uso**: Para acceder a la API de Supabase (REST, Realtime, etc.)
- **Formato**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (token JWT largo)
- **✅ Esta es la correcta**

## Cómo Obtenerla

### Opción 1: Dashboard de Supabase (Si tienes acceso)

1. Ve a: https://supabase.com/dashboard/project/lmqpbtuljodwklxdixjq/settings/api

2. En la sección **"Project API keys"** verás:
   ```
   📋 Project API keys
   
   anon public        eyJhbGciOiJIUzI1NiIsInR5cC...  [Copy]
                      This key is safe to use in a browser
   
   service_role       eyJhbGciOiJIUzI1NiIsInR5cC...  [Copy]
                      This key has the ability to bypass Row Level Security
   ```

3. **Copia la clave "anon public"** (la primera)

### Opción 2: Crear Tu Propio Proyecto (Gratis, 5 minutos)

Si no tienes acceso al proyecto `lmqpbtuljodwklxdixjq`:

1. Ve a: https://supabase.com/
2. Click "Start your project"
3. Sign up / Sign in
4. Crea un nuevo proyecto
5. Ve a Settings → API
6. Copia la "anon public key"
7. Crea la tabla usando el SQL de `docs/DATABASE.md`

## Actualizar el Backend

Una vez tengas la clave correcta:

```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/backend
nano .env
```

Cambia:
```env
SUPABASE_KEY=sb_publishable_JeXh7gEgHiVx1LQBCcFidA_Ki0ARx4F
```

Por:
```env
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (tu clave anon completa aquí)
```

Guarda (Ctrl+O, Enter, Ctrl+X)

## Verificar

```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/backend
source venv/bin/activate
python test_connection.py
```

Si ves:
```
✅ Conexión a Supabase exitosa!
✅ Tabla 'signals' encontrada!
```

¡Listo! Ya puedes iniciar el proyecto:
```bash
python main.py
```

## Resumen

- ❌ `sb_publishable_...` = NO sirve
- ✅ `eyJhbGciOiJ...` = Esta es la correcta
- 🔍 Búscala en el Dashboard de Supabase → Settings → API → "anon public"
