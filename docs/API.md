# 🔌 Guía de API

## URL Base
```
http://localhost:8000/api
```

## Endpoints

### 1. Health Check
**GET** `/health`

Verifica el estado del servicio.

**Response:**
```json
{
  "status": "healthy",
  "service": "Santa Cruz Signal Analytics API"
}
```

---

### 2. Obtener Señales
**GET** `/signals`

Obtiene señales con filtros opcionales.

**Query Parameters:**
- `limit` (int, opcional): Límite de registros (default: 1000)
- `provincia` (string, opcional): Filtrar por provincia
- `municipio` (string, opcional): Filtrar por municipio
- `empresa` (string, opcional): Filtrar por empresa
- `tipo_senal` (string, opcional): Filtrar por tipo de señal

**Ejemplo:**
```bash
GET /api/signals?provincia=Andrés+Ibáñez&limit=500
```

**Response:**
```json
{
  "success": true,
  "count": 500,
  "data": [
    {
      "id": 1,
      "latitud": -17.8146,
      "longitud": -63.1561,
      "tipo_senal": "4G",
      "empresa": "Entel",
      "nivel_bateria": 85,
      "provincia": "Andrés Ibáñez",
      "municipio": "Santa Cruz de la Sierra"
    }
  ]
}
```

---

### 3. Datos Agregados
**POST** `/analytics/aggregate`

Procesa y agrega datos usando Spark ETL.

**Request Body:**
```json
{
  "provincias": ["Andrés Ibáñez"],
  "municipios": [],
  "empresas": ["Entel", "Tigo"],
  "tipos_senal": ["4G", "5G"],
  "fecha_inicio": null,
  "fecha_fin": null
}
```

**Response:**
```json
{
  "success": true,
  "total_signals": 1523,
  "average_battery": 72.5,
  "signals_by_company": {
    "Entel": 823,
    "Tigo": 450,
    "Viva": 250
  },
  "signals_by_type": {
    "4G": 1200,
    "5G": 323
  },
  "geographic_distribution": {
    "provincias": {
      "Andrés Ibáñez": 1523
    },
    "municipios": {
      "Santa Cruz de la Sierra": 1200,
      "Cotoca": 323
    }
  },
  "statistics": {
    "total_signals": 1523,
    "average_battery": 72.5,
    "min_battery": 12,
    "max_battery": 100,
    "average_altitude": 415.3
  }
}
```

---

### 4. Puntos del Mapa
**GET** `/map/points`

Obtiene puntos geográficos para visualización en mapa.

**Query Parameters:**
- `limit` (int, opcional): Límite de puntos (default: 5000)
- `provincia` (string, opcional): Filtrar por provincia
- `municipio` (string, opcional): Filtrar por municipio

**Ejemplo:**
```bash
GET /api/map/points?limit=1000&provincia=Andrés+Ibáñez
```

**Response:**
```json
{
  "success": true,
  "count": 1000,
  "points": [
    {
      "lat": -17.8146,
      "lng": -63.1561,
      "tipo_senal": "4G",
      "empresa": "Entel",
      "nivel_bateria": 85,
      "provincia": "Andrés Ibáñez",
      "municipio": "Santa Cruz de la Sierra"
    }
  ]
}
```

---

### 5. Serie Temporal
**GET** `/analytics/timeseries`

Obtiene serie temporal de señales.

**Query Parameters:**
- `interval` (string, opcional): Intervalo de tiempo - `hour` o `day` (default: hour)
- `provincia` (string, opcional): Filtrar por provincia

**Ejemplo:**
```bash
GET /api/analytics/timeseries?interval=hour
```

**Response:**
```json
{
  "success": true,
  "interval": "hour",
  "data": [
    {
      "timestamp": "2025-12-03T18:00:00",
      "count": 145,
      "avg_battery": 74.2
    },
    {
      "timestamp": "2025-12-03T19:00:00",
      "count": 167,
      "avg_battery": 71.8
    }
  ]
}
```

---

### 6. Opciones de Filtros
**GET** `/filters/options`

Obtiene valores únicos disponibles para filtros.

**Response:**
```json
{
  "success": true,
  "provincias": [
    "Andrés Ibáñez",
    "Warnes",
    "Montero"
  ],
  "municipios": [
    "Santa Cruz de la Sierra",
    "Cotoca",
    "Warnes"
  ],
  "empresas": [
    "Entel",
    "Tigo",
    "Viva"
  ],
  "tipos_senal": [
    "3G",
    "4G",
    "5G",
    "LTE"
  ]
}
```

---

## WebSocket

### Endpoint
```
ws://localhost:8000/api/ws/signals
```

### Eventos

#### Cliente → Servidor
```json
{
  "action": "refresh",
  "filters": {
    "provincias": ["Andrés Ibáñez"],
    "empresas": ["Entel"]
  }
}
```

#### Servidor → Cliente
```json
// Datos iniciales
{
  "type": "initial",
  "data": [ /* señales */ ]
}

// Actualización
{
  "type": "update",
  "data": [ /* señales actualizadas */ ],
  "timestamp": 1701632400.123
}

// Nueva señal
{
  "type": "new_signal",
  "data": { /* nueva señal */ }
}

// Heartbeat
{
  "type": "ping",
  "timestamp": 1701632400.123
}
```

---

## Códigos de Estado

- `200 OK` - Solicitud exitosa
- `400 Bad Request` - Parámetros inválidos
- `500 Internal Server Error` - Error del servidor

---

## Ejemplo de Uso con cURL

```bash
# Obtener estadísticas
curl -X POST http://localhost:8000/api/analytics/aggregate \
  -H "Content-Type: application/json" \
  -d '{
    "provincias": ["Andrés Ibáñez"],
    "empresas": ["Entel"]
  }'

# Obtener puntos del mapa
curl "http://localhost:8000/api/map/points?limit=100"

# Obtener opciones de filtros
curl http://localhost:8000/api/filters/options
```

---

## Documentación Interactiva

FastAPI genera documentación automática:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
