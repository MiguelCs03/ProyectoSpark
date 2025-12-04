# 🗺️ Divisiones Geográficas de Santa Cruz

## ✅ Nueva Funcionalidad Implementada

### **Provincias de Santa Cruz**

Se agregó soporte para visualizar las **13 provincias** de Santa Cruz en el mapa:

#### **Provincias Disponibles:**
1. **Andrés Ibáñez** (capital: Santa Cruz de la Sierra)
2. **Angel Sandoval**
3. **Chiquitos**
4. **Cordillera**
5. **Florida**
6. **Germán Busch**
7. **Ichilo**
8. **Manuel María Caballero**
9. **Ñuflo De Chávez**
10. **Sara**
11. **Vallegrande**
12. **Velasco**
13. **Warnes**

---

## 📁 **Archivos Creados/Modificados**

### 1. **`extract_santa_cruz.py`** (NUEVO)
- Script Python para extraer las provincias de Santa Cruz del archivo nacional
- Filtra solo las 13 provincias de Santa Cruz del GeoJSON de Bolivia
- Genera: `frontend/public/santa-cruz-provinces.geojson`

### 2. **`frontend/public/santa-cruz-provinces.geojson`** (NUEVO)
- Archivo GeoJSON con solo las provincias de Santa Cruz
- Tamaño reducido comparado al archivo nacional (22+ MB)
- Contiene geometrías y propiedades de cada provincia

### 3. **`frontend/src/components/MapView.jsx`** (MODIFICADO)
- Carga automática de ambos archivos GeoJSON (distritos y provincias)
- Lógica para alternar entre capas:
  - **Distritos**: Usa `santa-cruz-districts.geojson`
  - **Provincias**: Usa `santa-cruz-provinces.geojson`
  - **Zonas**: Usa `santa-cruz-districts.geojson` (temporal)

---

## 🎯 **Cómo Usar**

### En el Dashboard:

1. **Abrir el sidebar** (panel izquierdo)

2. **Ir a "🗺️ Divisiones Geográficas"**

3. **Seleccionar**:
   - 🏘️ **Distritos** → Muestra distritos/barrios de Santa Cruz
   - 🏛️ **Provincias** → Muestra las 13 provincias de Santa Cruz
   - 🌍 **Zonas** → Muestra zonas (actualmente usa distritos)

4. **El mapa se actualiza automáticamente** mostrando las divisiones

---

## 📊 **Análisis por Provincia**

Cuando seleccionas "Provincias", puedes:

- **Ver límites** de cada provincia en el mapa
- **Hacer hover** sobre una provincia para ver más información
- **Combinar con filtro de operadora** para análisis específico:
  - Ejemplo: ENTEL en provincia Andrés Ibáñez
  - Ejemplo: TIGO en provincia Cordillera

---

## 🔄 **Flujo de Datos**

```
geoBoundaries-BOL-ADM2.geojson (Bolivia completa, 22+ MB)
    ↓
extract_santa_cruz.py (filtrar solo Santa Cruz)
    ↓
santa-cruz-provinces.geojson (solo 13 provincias)
    ↓
MapView.jsx (cargar y renderizar)
    ↓
Leaflet Map (visualización interactiva)
```

---

## 🎨 **Visualización**

### Colores de Provincias:
- Se usa una paleta de colores variable para distinguir provincias
- Efecto hover: La provincia se ilumina al pasar el mouse
- Popup: Info detallada al hacer clic

### Combinado con:
- ✅ **Filtro de operadora**: Ver señales de ENTEL solo en provincia X
- ✅ **Mapa de calor**: Intensidad de señal por provincia
- ✅ **Puntos coloreados**: Señal por intensidad en cada provincia

---

## 📈 **Casos de Uso**

### 1. **Comparar calidad de señal entre provincias**
```
1. Seleccionar "Provincias"
2. Filtrar por operadora (ej: ENTEL)
3. Observar colores de puntos en cada provincia
4. Verde = buena señal, Rojo = mala señal
```

### 2. **Identificar provincia con mejor cobertura**
```
1. Seleccionar "Provincias"
2. Ver mapa de calor
3. Provincia más roja = más intensidad
4. Comparar entre provincias
```

### 3. **Análisis por operadora y provincia**
```
1. Filtrar TIGO
2. Seleccionar "Provincias"
3. Ver en qué provincias TIGO tiene más presencia
4. Identificar zonas sin cobertura
```

---

## 🔧 **Técnico**

### Estructura del GeoJSON:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "shapeName": "Andrés Ibáñez",
        "shapeISO": "",
        "shapeID": "...",
        "shapeGroup": "BOL",
        "shapeType": "ADM2"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [...]
      }
    }
  ]
}
```

### Propiedades disponibles:
- `shapeName`: Nombre de la provincia
- `shapeType`: Tipo de división (ADM2 = provincia)
- `geometry`: Polígonos de la provincia

---

## ✨ **Resultado**

Un mapa interactivo que:
- ✅ Muestra **13 provincias** de Santa Cruz
- ✅ Permite **filtrar por operadora**
- ✅ Combina con **mapa de calor**
- ✅ Visualiza **intensidad de señal por colores**
- ✅ Ofrece **análisis geográfico detallado**

**¡Listo para análisis provincial completo!** 🗺️📊✨
