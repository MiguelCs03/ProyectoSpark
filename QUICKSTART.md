# ⚡ Quick Start Guide

## 🚀 Inicio Rápido (5 minutos)

### Prerequisitos
- Python 3.8+
- Node.js 16+
- Git

### Paso 1: Clonar y Configurar
```bash
# Clonar repositorio
git clone <repo-url>
cd spark

# Dar permisos a scripts
chmod +x install.sh start.sh
```

### Paso 2: Configurar Variables de Entorno
```bash
# Editar credenciales de Supabase
cd backend
nano .env

# Agregar:
SUPABASE_URL=https://lmqpbtuljodwklxdixjq.supabase.co
SUPABASE_KEY=sb_publishable_JeXh7gEgHiVx1LQBCcFidA_Ki0ARx4F
API_HOST=0.0.0.0
API_PORT=8000
```

### Paso 3: Instalar Dependencias
```bash
cd ..
./install.sh
```

### Paso 4: Iniciar Aplicación
```bash
./start.sh
```

¡Listo! Abre http://localhost:5173 en tu navegador.

---

## 📋 Comandos Útiles

### Iniciar servicios
```bash
# Ambos servicios
./start.sh

# Solo backend
cd backend && source venv/bin/activate && python main.py

# Solo frontend
cd frontend && npm run dev
```

### Verificar estado
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173
```

### Ver logs
```bash
# Backend está corriendo en terminal
# Frontend está corriendo en terminal
```

---

## 🗺️ Estructura del Proyecto

```
spark/
├── backend/              # API Python + Spark
│   ├── app/
│   │   ├── api/         # Endpoints
│   │   ├── etl/         # Spark ETL
│   │   ├── models/      # Modelos Pydantic
│   │   └── services/    # Lógica de negocio
│   ├── main.py          # Punto de entrada
│   └── requirements.txt
│
├── frontend/            # UI React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── services/    # API clients
│   │   └── App.jsx      # Componente principal
│   └── package.json
│
├── docs/                # Documentación
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
└── README.md
```

---

## 🎯 Características Principales

### ✅ Dashboard Interactivo
- Visualización en tiempo real
- Mapa interactivo de Santa Cruz
- Gráficos dinámicos

### ✅ Filtros Avanzados
- Por provincia
- Por municipio
- Por empresa proveedora
- Por tipo de señal (3G, 4G, 5G, LTE)

### ✅ Big Data con Spark
- Procesamiento distribuido
- Agregaciones eficientes
- Análisis en tiempo real

### ✅ WebSocket Real-time
- Actualización automática
- Nuevas señales al instante
- Heartbeat connection

---

## 🔍 Troubleshooting Rápido

### Error: "Puerto 8000 ya en uso"
```bash
# Encontrar y matar proceso
lsof -i :8000
kill -9 <PID>
```

### Error: "Java not found" (Spark)
```bash
# Instalar Java
sudo apt install openjdk-11-jre-headless

# Verificar
java -version
```

### Error: "Module not found" (Frontend)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Supabase connection failed"
```bash
# Verificar credenciales en backend/.env
cat backend/.env

# Probar conexión
curl -H "apikey: YOUR_KEY" "https://YOUR_PROJECT.supabase.co/rest/v1/"
```

---

## 📊 Datos de Prueba

Si tu base de datos está vacía, puedes agregar datos de prueba:

```sql
-- En Supabase SQL Editor
INSERT INTO signals (latitud, longitud, tipo_senal, empresa, nivel_bateria, provincia, municipio)
VALUES 
  (-17.783300, -63.182140, '4G', 'Entel', 85, 'Andrés Ibáñez', 'Santa Cruz de la Sierra'),
  (-17.814600, -63.156100, '5G', 'Tigo', 92, 'Andrés Ibáñez', 'Santa Cruz de la Sierra'),
  (-17.800000, -63.170000, '4G', 'Viva', 67, 'Andrés Ibáñez', 'Santa Cruz de la Sierra');
```

---

## 📚 Documentación Completa

- **API**: `docs/API.md`
- **Arquitectura**: `docs/ARCHITECTURE.md`
- **Base de Datos**: `docs/DATABASE.md`
- **Deployment**: `docs/DEPLOYMENT.md`

---

## 💡 Tips y Trucos

1. **Actualizar datos automáticamente**: El WebSocket se conecta automáticamente
2. **Filtrar rápido**: Usa checkboxes en el sidebar
3. **Ver detalle**: Click en marcadores del mapa
4. **API Docs**: http://localhost:8000/docs (Swagger UI)
5. **Refresh manual**: Botón "🔄 Actualizar" en header

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que Java esté instalado (`java -version`)
2. Verifica que Python 3.8+ esté instalado (`python3 --version`)
3. Verifica que Node.js esté instalado (`node --version`)
4. Revisa los logs en la terminal
5. Verifica las credenciales de Supabase en `.env`

---

## 🎨 Personalización

### Cambiar colores del mapa
Edita `frontend/src/components/MapView.jsx`:
```javascript
const SIGNAL_COLORS = {
  '5G': '#tu-color',
  '4G': '#tu-color',
  // ...
};
```

### Cambiar límite de puntos en mapa
Edita `frontend/src/App.jsx`:
```javascript
const mapResponse = await ApiService.getMapPoints({
  ...mapFilters,
  limit: 10000 // Cambiar aquí
});
```

### Agregar nuevo filtro
1. Actualizar modelo en `backend/app/models/signal.py`
2. Agregar lógica en `backend/app/services/supabase_service.py`
3. Agregar UI en `frontend/src/components/FilterSidebar.jsx`
