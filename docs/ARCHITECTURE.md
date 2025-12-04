# 🏗️ Arquitectura del Sistema

## Visión General

Sistema de **Big Data Analytics** para análisis en tiempo real de señales de internet en Santa Cruz, Bolivia. Utiliza Apache Spark para procesamiento ETL, FastAPI para el backend, y React para visualización interactiva.

## Stack Tecnológico

### Backend
- **Python 3.x** - Lenguaje principal
- **Apache Spark (PySpark)** - Motor de procesamiento Big Data
- **FastAPI** - Framework web asíncrono
- **Supabase** - Base de datos y real-time subscriptions
- **WebSockets** - Comunicación bidireccional en tiempo real
- **Pydantic** - Validación de datos

### Frontend
- **React 19** - UI Framework
- **Vite** - Build tool y dev server
- **Leaflet** - Mapas interactivos
- **Recharts** - Visualización de datos
- **Axios** - Cliente HTTP
- **WebSocket API** - Conexión tiempo real

## Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  MapView    │  │   Charts    │  │   Filters   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                 │                 │            │
│         └─────────────────┴─────────────────┘            │
│                          │                               │
│                  ┌───────▼────────┐                      │
│                  │  API Service   │                      │
│                  │  WS Service    │                      │
│                  └───────┬────────┘                      │
└──────────────────────────┼──────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   HTTP / WS     │
                  └────────┬────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Endpoints                        │   │
│  │  /signals  /analytics  /map/points  /timeseries  │   │
│  └─────────────────────┬─────────────────────────────┘   │
│                        │                                 │
│         ┌──────────────┼──────────────┐                  │
│         │              │              │                  │
│  ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐           │
│  │  Supabase   │ │  Spark   │ │ WebSocket  │           │
│  │  Service    │ │  ETL     │ │  Manager   │           │
│  └──────┬──────┘ └────┬─────┘ └─────┬──────┘           │
│         │             │              │                  │
└─────────┼─────────────┼──────────────┼──────────────────┘
          │             │              │
     ┌────▼─────────────▼──────────────▼────┐
     │         SUPABASE DATABASE             │
     │  Tabla: signals                       │
     │  - Real-time subscriptions            │
     │  - PostgreSQL backend                 │
     └───────────────────────────────────────┘
```

## Flujo de Datos

### 1. Carga Inicial
```
Frontend → API (/filters/options) → Supabase → Frontend
Frontend → API (/analytics/aggregate) → Spark ETL → Frontend
Frontend → API (/map/points) → Supabase → Spark → Frontend
```

### 2. Tiempo Real (WebSocket)
```
Supabase (new data) → Backend WS → Connected Clients → Auto-refresh
```

### 3. Procesamiento ETL con Spark
```
Raw Data → SparkSession → DataFrame
         → Transformations (filter, aggregate, join)
         → Results (JSON)
         → Frontend
```

## Principios de Diseño

### KISS (Keep It Simple, Stupid)
- **Código claro y directo**: Funciones pequeñas con responsabilidad única
- **Estructura simple**: Carpetas organizadas por función
- **APIs RESTful**: Endpoints intuitivos y predecibles

### YAGNI (You Aren't Gonna Need It)
- **Solo lo necesario**: No features especulativas
- **Filtros esenciales**: Provincia, municipio, empresa, tipo señal
- **Métricas útiles**: Total, promedio, distribución

### Código Limpio
- **Nombres descriptivos**: Variables y funciones auto-documentadas
- **Separación de concerns**: Backend/Frontend, Data/UI, Logic/Presentation
- **Type hints en Python**: Pydantic models para validación
- **PropTypes implícitos**: React components con validación

## Optimizaciones de Rendimiento

### Backend
1. **Spark Local Mode**: `local[*]` usa todos los cores disponibles
2. **Lazy Evaluation**: Spark solo ejecuta al necesitar resultados
3. **Caching**: DataFrame caching para queries repetidas
4. **Async Operations**: FastAPI async/await

### Frontend
1. **Code Splitting**: Vite lazy loading automático
2. **Debouncing**: Filtros con timeouts para reducir requests
3. **Memoization**: React useMemo para cálculos costosos
4. **Virtualization**: Límite de 5000 puntos en mapa

## Escalabilidad

### Horizontal
- Backend: Múltiples workers con Uvicorn
- Spark: Cluster mode para datasets grandes
- Frontend: CDN deployment

### Vertical
- Spark Memory: Configurar `spark.driver.memory`
- Database: Indexes en columnas de filtrado
- WebSocket: Connection pooling

## Seguridad

- CORS configurado para localhost
- Validación con Pydantic
- Environment variables para secrets
- SQL injection prevention (Supabase client)

## Monitoreo y Logging

```python
# Backend logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

- Logs de Spark: WARN level
- Logs de API: INFO level
- WebSocket events: DEBUG level
