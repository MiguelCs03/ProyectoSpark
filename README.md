# 📡 Santa Cruz Internet Signal Analytics

Sistema de análisis en tiempo real de datos de señal de internet en Santa Cruz, Bolivia utilizando **Apache Spark**, **Python** y **React**.

## 🎯 Características

- ✅ Procesamiento ETL con Apache Spark
- ✅ Visualización en mapa interactivo
- ✅ Datos en tiempo real desde Supabase
- ✅ Filtros por: Provincias, Distritos, Zonas, Municipios
- ✅ Análisis multidimensional (tiempo, empresa, tipo de señal)
- ✅ Código limpio siguiendo principios KISS y YAGNI

## 📊 Datos Analizados

- Tipo de señal
- Empresa proveedora
- Ubicación (latitud, longitud, altura)
- Nivel y porcentaje de batería
- Timestamp

## 🚀 Estructura del Proyecto

```
spark/
├── backend/              # Python + FastAPI + PySpark
│   ├── app/
│   │   ├── api/         # Endpoints REST y WebSocket
│   │   ├── etl/         # Procesos Spark ETL
│   │   ├── models/      # Modelos de datos
│   │   └── services/    # Servicios de negocio
│   ├── requirements.txt
│   └── main.py
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── services/    # API clients
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔧 Instalación

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📝 Variables de Entorno

Crear archivo `.env` en `/backend`:
```
SUPABASE_URL=https://lmqpbtuljodwklxdixjq.supabase.co
SUPABASE_KEY=sb_publishable_JeXh7gEgHiVx1LQBCcFidA_Ki0ARx4F
```

## 🗺️ Filtros Disponibles

- **Geográficos**: Provincia, Distrito, Zona, Municipio
- **Temporales**: Hora, Día, Semana, Mes
- **Técnicos**: Tipo de señal, Empresa, Nivel de batería

## 📈 Big Data Processing

El sistema utiliza Apache Spark para:
- Transformar datos crudos de Supabase
- Agregar métricas en tiempo real
- Calcular estadísticas espaciales
- Optimizar consultas geoespaciales
