# 🗄️ Esquema de Base de Datos Supabase

## Tabla: signals

Esta es la tabla principal que almacena todas las señales de internet.

### Estructura de la Tabla

```sql
CREATE TABLE signals (
    id BIGSERIAL PRIMARY KEY,
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    altura DOUBLE PRECISION,
    tipo_senal VARCHAR(50) NOT NULL,
    empresa VARCHAR(100) NOT NULL,
    nivel_bateria INTEGER CHECK (nivel_bateria >= 0 AND nivel_bateria <= 100),
    porcentaje_bateria DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    zona VARCHAR(100),
    municipio VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Índices Recomendados

Para optimizar las consultas:

```sql
-- Índice geoespacial
CREATE INDEX idx_signals_location ON signals (latitud, longitud);

-- Índices para filtros
CREATE INDEX idx_signals_provincia ON signals (provincia);
CREATE INDEX idx_signals_municipio ON signals (municipio);
CREATE INDEX idx_signals_empresa ON signals (empresa);
CREATE INDEX idx_signals_tipo_senal ON signals (tipo_senal);
CREATE INDEX idx_signals_timestamp ON signals (timestamp DESC);

-- Índice compuesto para consultas comunes
CREATE INDEX idx_signals_geo_empresa ON signals (provincia, municipio, empresa);
```

### Triggers

```sql
-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_signals_updated_at 
    BEFORE UPDATE ON signals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Ejemplo de Datos

### Insertar datos de prueba

```sql
INSERT INTO signals (
    latitud, longitud, altura, tipo_senal, empresa, 
    nivel_bateria, porcentaje_bateria, provincia, 
    distrito, zona, municipio
) VALUES
    (-17.783300, -63.182140, 415.5, '4G', 'Entel', 85, 85.3, 'Andrés Ibáñez', 'Distrito 1', 'Zona Norte', 'Santa Cruz de la Sierra'),
    (-17.814600, -63.156100, 420.0, '5G', 'Tigo', 92, 92.1, 'Andrés Ibáñez', 'Distrito 2', 'Zona Centro', 'Santa Cruz de la Sierra'),
    (-17.800000, -63.170000, 410.0, '4G', 'Viva', 67, 67.5, 'Andrés Ibáñez', 'Distrito 3', 'Zona Sur', 'Santa Cruz de la Sierra'),
    (-17.820000, -63.160000, 425.0, 'LTE', 'Entel', 78, 78.9, 'Andrés Ibáñez', 'Distrito 1', 'Zona Este', 'Santa Cruz de la Sierra'),
    (-17.750000, -63.200000, 400.0, '4G', 'Tigo', 55, 55.2, 'Warnes', 'Centro', 'Zona Industrial', 'Warnes');
```

---

## Configuración de Real-time

En Supabase Dashboard:

1. Ve a **Database** → **Replication**
2. Habilita replicación para la tabla `signals`
3. Configura publicación:

```sql
-- Crear publicación para real-time
CREATE PUBLICATION supabase_realtime FOR TABLE signals;
```

---

## Row Level Security (RLS)

Para producción, habilitar RLS:

```sql
-- Habilitar RLS
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Allow public read access" 
ON signals FOR SELECT 
USING (true);

-- Política para inserción autenticada
CREATE POLICY "Allow authenticated insert" 
ON signals FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
```

---

## Vistas Útiles

### Vista agregada por municipio

```sql
CREATE VIEW signals_by_municipio AS
SELECT 
    municipio,
    COUNT(*) as total_signals,
    AVG(nivel_bateria) as avg_battery,
    COUNT(DISTINCT empresa) as num_companies,
    MAX(timestamp) as last_signal
FROM signals
WHERE municipio IS NOT NULL
GROUP BY municipio;
```

### Vista de señales recientes

```sql
CREATE VIEW recent_signals AS
SELECT *
FROM signals
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

---

## Backup

### Backup manual

```bash
pg_dump -h db.yourproject.supabase.co -U postgres -d postgres -t signals > backup_signals.sql
```

### Restore

```bash
psql -h db.yourproject.supabase.co -U postgres -d postgres < backup_signals.sql
```

---

## Mantenimiento

### Limpiar datos antiguos

```sql
-- Eliminar datos más antiguos a 1 año
DELETE FROM signals 
WHERE timestamp < NOW() - INTERVAL '1 year';

-- O archivar en otra tabla
CREATE TABLE signals_archive AS 
SELECT * FROM signals 
WHERE timestamp < NOW() - INTERVAL '1 year';

DELETE FROM signals 
WHERE timestamp < NOW() - INTERVAL '1 year';
```

### VACUUM

```sql
VACUUM ANALYZE signals;
```

---

## Consultas de Ejemplo

```sql
-- Señales por empresa en Santa Cruz
SELECT empresa, COUNT(*) as total
FROM signals
WHERE municipio = 'Santa Cruz de la Sierra'
GROUP BY empresa
ORDER BY total DESC;

-- Promedio de batería por tipo de señal
SELECT tipo_senal, AVG(nivel_bateria) as avg_battery
FROM signals
GROUP BY tipo_senal;

-- Zonas con más señales
SELECT zona, COUNT(*) as total
FROM signals
WHERE zona IS NOT NULL
GROUP BY zona
ORDER BY total DESC
LIMIT 10;

-- Señales por día
SELECT 
    DATE(timestamp) as fecha,
    COUNT(*) as total_signals
FROM signals
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY fecha DESC;
```
