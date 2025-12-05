/**
 * Map Component - Mapa interactivo con Leaflet
 * Visualiza puntos de señales en Santa Cruz
 */
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, useMap } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import ClusterLayer from './ClusterLayer';
import 'leaflet/dist/leaflet.css';

// Configuración del mapa centrado en Santa Cruz, Bolivia
const SANTA_CRUZ_CENTER = [-17.8146, -63.1561];
const DEFAULT_ZOOM = 12;

// Colores por tipo de señal
const SIGNAL_COLORS = {
    '5G': '#22c55e',
    '4G': '#3b82f6',
    '3G': '#f59e0b',
    'LTE': '#8b5cf6',
    'default': '#6b7280'
};

// Componente para ajustar vista del mapa
function MapBounds({ points }) {
    const map = useMap();
    const hasFittedRef = useRef(false);

    useEffect(() => {
        // Solo ajustar vista si hay puntos y no se ha ajustado antes (o si los puntos se reiniciaron)
        if (points && points.length > 0) {
            // Si es la primera carga significativa (ej. > 0 puntos), ajustamos
            // Pero si estamos cargando incrementalmente, no queremos reajustar cada 5 segundos

            // Estrategia: Ajustar solo si no hemos ajustado, o si los puntos cambiaron drásticamente (filtro nuevo)
            // Como detectamos filtro nuevo? points.length suele bajar a 0 o cambiar mucho.
            // Pero aquí points crece.

            if (!hasFittedRef.current) {
                const bounds = points
                    .map(p => {
                        const lat = p.latitude || p.lat;
                        const lng = p.longitude || p.lng;
                        return (lat && lng) ? [lat, lng] : null;
                    })
                    .filter(b => b !== null);

                if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
                    hasFittedRef.current = true;
                }
            }
        } else if (points && points.length === 0) {
            // Resetear flag si los puntos se limpian (cambio de filtro)
            hasFittedRef.current = false;
        }
    }, [points, map]);

    return null;
}

export default function MapView({ points = [], selectedFilters, heatmapData = [] }) {
    const [districtsData, setDistrictsData] = useState(null);
    const [provincesData, setProvincesData] = useState(null);
    const [municipiosData, setMunicipiosData] = useState(null);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [heatmapMetric, setHeatmapMetric] = useState('signal'); // 'signal' or 'speed'

    // Cargar datos de distritos
    useEffect(() => {
        fetch('/santa-cruz-districts.geojson')
            .then(response => response.json())
            .then(data => setDistrictsData(data))
            .catch(error => console.error('Error loading districts:', error));

        // Cargar datos de provincias
        fetch('/santa-cruz-provinces.geojson')
            .then(response => response.json())
            .then(data => setProvincesData(data))
            .catch(error => console.error('Error loading provinces:', error));

        // Cargar datos de municipios
        fetch('/santa_cruz_municipios.geojson')
            .then(response => response.json())
            .then(data => setMunicipiosData(data))
            .catch(error => console.error('Error loading municipios:', error));
    }, []);

    // Función para obtener color basado en intensidad de señal (COLORES MÁS VIBRANTES)
    const getSignalColor = (signal) => {
        // Señal en dBm: -40 (excelente) a -100 (pobre)
        if (signal >= -60) return '#00ff00';  // Verde neón - Excelente
        if (signal >= -70) return '#7df900';  // Verde lima - Muy buena
        if (signal >= -80) return '#ffff00';  // Amarillo puro - Buena
        if (signal >= -90) return '#ff6600';  // Naranja intenso - Regular
        return '#ff0000';  // Rojo puro - Pobre
    };

    const getMarkerSize = (signal) => {
        // Tamaño basado en calidad de señal (MÁS GRANDE)
        if (signal >= -60) return 12;  // Excelente
        if (signal >= -70) return 10;   // Muy buena
        if (signal >= -80) return 8;   // Buena
        if (signal >= -90) return 6;   // Regular
        return 5;  // Pobre
    };

    // Filtrar puntos por operadora seleccionada
    const filteredPoints = selectedFilters?.selectedOperator
        ? points.filter(p => p.sim_operator === selectedFilters.selectedOperator)
        : points;

    // Filtrar heatmap por operadora
    const filteredHeatmap = selectedFilters?.selectedOperator
        ? heatmapData.filter(h => h.operator === selectedFilters.selectedOperator)
        : heatmapData;

    // Paleta de colores para provincias
    const PROVINCE_COLORS = {
        'Andres Ibañez': '#ef4444',
        'Warnes': '#f97316',
        'Ichilo': '#eab308',
        'Sara': '#84cc16',
        'Obispo Santistevan': '#06b6d4',
        'Chiquitos': '#3b82f6',
        'Cordillera': '#8b5cf6',
        'Vallegrande': '#d946ef',
        'Florida': '#f43f5e',
        'default': '#6b7280'
    };

    const getProvinceColor = (provincia) => {
        return PROVINCE_COLORS[provincia] || PROVINCE_COLORS.default;
    };

    // Estilo dinámico según la capa seleccionada
    const getGeoStyle = (feature) => {
        const layerType = selectedFilters?.layer || 'none';

        if (layerType === 'provincias') {
            return {
                fillColor: getProvinceColor(feature.properties.provincia),
                fillOpacity: 0.4,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                dashArray: ''
            };
        }

        if (layerType === 'distritos') {
            return {
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                color: '#22c55e', // Verde brillante para líneas
                weight: 3,        // Líneas más gruesas
                opacity: 0.8,
                dashArray: '5, 5'
            };
        }

        if (layerType === 'municipios') {
            return {
                fillColor: '#10b981', // Emerald 500
                fillOpacity: 0.2,
                color: '#059669', // Emerald 600
                weight: 2,
                opacity: 0.8,
                dashArray: '4, 4'
            };
        }

        if (layerType === 'zonas') {
            // Simulación de zonas usando distritos con otro estilo
            return {
                fillColor: '#8b5cf6',
                fillOpacity: 0.2,
                color: '#d946ef',
                weight: 2,
                opacity: 0.8,
                dashArray: '2, 4'
            };
        }

        return { opacity: 0, fillOpacity: 0 }; // Ocultar si es 'none'
    };

    // Highlight al pasar el mouse
    const highlightFeature = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillOpacity: 0.5,
            weight: 4,
            opacity: 1,
            color: '#fbbf24' // Amarillo al resaltar
        });
        layer.bringToFront();
    };

    const resetHighlight = (e) => {
        const layer = e.target;
        // Restaurar estilo original
        if (selectedFilters?.layer && selectedFilters.layer !== 'none') {
            // Necesitamos pasar el feature para obtener el estilo correcto (especialmente para provincias)
            const style = getGeoStyle(e.target.feature);
            layer.setStyle(style);
        }
    };

    // Filtrar features según capa (opcional, por ahora mostramos todo el geojson con diferentes estilos)
    const shouldShowLayer = selectedFilters?.layer && selectedFilters.layer !== 'none';

    // Función helper para verificar si un punto está dentro de un polígono
    const isPointInPolygon = (point, geometry) => {
        try {
            if (!point || !point.latitude || !point.longitude) return false;

            const lat = point.latitude;
            const lng = point.longitude;

            // Manejar tanto Polygon como MultiPolygon
            let coordinates = geometry.coordinates;

            if (geometry.type === 'MultiPolygon') {
                // Para MultiPolygon, verificar cada polígono
                for (let poly of coordinates) {
                    if (checkPolygon(lng, lat, poly[0])) {
                        return true;
                    }
                }
                return false;
            } else if (geometry.type === 'Polygon') {
                return checkPolygon(lng, lat, coordinates[0]);
            }

            return false;
        } catch (e) {
            console.error('Error checking point in polygon:', e);
            return false;
        }
    };

    const checkPolygon = (x, y, polygon) => {
        // Ray-casting algorithm
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    // ALTERNATIVA MÁS SIMPLE: Usar bounding box + sampling
    const getDistrictBounds = (geometry) => {
        const coords = geometry.type === 'Polygon'
            ? geometry.coordinates[0]
            : geometry.coordinates[0][0];

        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        coords.forEach(([lng, lat]) => {
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        });

        return { minLat, maxLat, minLng, maxLng };
    };

    // Calcular estadísticas del distrito
    const calculateDistrictStats = (districtGeometry) => {
        console.log('🔍 Calculando estadísticas del distrito...');
        console.log('Total de puntos disponibles:', points.length);

        // DEBUG: Ver estructura del primer punto
        if (points.length > 0) {
            console.log('🔬 Ejemplo de punto:', points[0]);
            console.log('🔬 Tiene lat?', points[0].lat, 'lng?', points[0].lng);
            console.log('🔬 Tiene latitude?', points[0].latitude, 'longitude?', points[0].longitude);
        }

        // Si no hay puntos, retornar stats vacías
        if (!points || points.length === 0) {
            console.log('⚠️ No hay puntos disponibles');
            return {
                total: 0,
                avgSignal: 0,
                avgSpeed: 0,
                entel: { count: 0, avgSignal: 0, avgSpeed: 0 },
                tigo: { count: 0, avgSignal: 0, avgSpeed: 0 },
                viva: { count: 0, avgSignal: 0, avgSpeed: 0 },
                wifi: 0,
                fourG: 0,
                threeG: 0
            };
        }

        // Primero usar bounding box para filtro rápido
        const bounds = getDistrictBounds(districtGeometry);
        console.log('📦 Bounds del distrito:', bounds);

        // Filtrar por bounding box primero (mucho más rápido)
        const pointsInBounds = points.filter(p =>
            p.latitude >= bounds.minLat && p.latitude <= bounds.maxLat &&
            p.longitude >= bounds.minLng && p.longitude <= bounds.maxLng
        );

        console.log(`📍 Puntos en bounding box: ${pointsInBounds.length} de ${points.length}`);

        // Luego verificar precisamente cuáles están dentro del polígono
        const pointsInDistrict = pointsInBounds.filter(p =>
            isPointInPolygon(p, districtGeometry)
        );

        console.log(`✅ Puntos en distrito (preciso): ${pointsInDistrict.length}`);

        if (pointsInDistrict.length === 0) {
            console.log('⚠️ No hay puntos dentro de este distrito');
            return {
                total: 0,
                avgSignal: 0,
                avgSpeed: 0,
                entel: { count: 0, avgSignal: 0, avgSpeed: 0 },
                tigo: { count: 0, avgSignal: 0, avgSpeed: 0 },
                viva: { count: 0, avgSignal: 0, avgSpeed: 0 },
                wifi: 0,
                fourG: 0,
                threeG: 0
            };
        }

        const stats = {
            total: pointsInDistrict.length,
            totalSignal: 0,
            totalSpeed: 0,
            entel: { count: 0, totalSignal: 0, totalSpeed: 0 },
            tigo: { count: 0, totalSignal: 0, totalSpeed: 0 },
            viva: { count: 0, totalSignal: 0, totalSpeed: 0 },
            wifi: 0,
            fourG: 0,
            threeG: 0
        };

        pointsInDistrict.forEach(point => {
            const signal = Math.abs(point.signal || 0); // Valor absoluto para cálculos
            const speed = point.speed || 0;

            stats.totalSignal += signal;
            stats.totalSpeed += speed;

            // Por operadora (normalizar nombres)
            const operator = (point.sim_operator || '').toUpperCase().trim();
            if (operator.includes('ENTEL')) {
                stats.entel.count++;
                stats.entel.totalSignal += signal;
                stats.entel.totalSpeed += speed;
            } else if (operator.includes('TIGO')) {
                stats.tigo.count++;
                stats.tigo.totalSignal += signal;
                stats.tigo.totalSpeed += speed;
            } else if (operator.includes('VIVA')) {
                stats.viva.count++;
                stats.viva.totalSignal += signal;
                stats.viva.totalSpeed += speed;
            }

            // Por tipo de red
            const netType = point.network_type;
            if (netType && netType.includes('WiFi')) stats.wifi++;
            else if (netType && netType.includes('4G')) stats.fourG++;
            else if (netType && netType.includes('3G')) stats.threeG++;
        });

        // Calcular promedios
        const avgSignal = -(stats.totalSignal / stats.total); // Negativo para dBm
        const avgSpeed = stats.totalSpeed / stats.total;

        const result = {
            total: stats.total,
            avgSignal: avgSignal.toFixed(1),
            avgSpeed: avgSpeed.toFixed(2),
            entel: {
                count: stats.entel.count,
                avgSignal: stats.entel.count > 0 ? (-(stats.entel.totalSignal / stats.entel.count)).toFixed(1) : 0,
                avgSpeed: stats.entel.count > 0 ? (stats.entel.totalSpeed / stats.entel.count).toFixed(2) : 0
            },
            tigo: {
                count: stats.tigo.count,
                avgSignal: stats.tigo.count > 0 ? (-(stats.tigo.totalSignal / stats.tigo.count)).toFixed(1) : 0,
                avgSpeed: stats.tigo.count > 0 ? (stats.tigo.totalSpeed / stats.tigo.count).toFixed(2) : 0
            },
            viva: {
                count: stats.viva.count,
                avgSignal: stats.viva.count > 0 ? (-(stats.viva.totalSignal / stats.viva.count)).toFixed(1) : 0,
                avgSpeed: stats.viva.count > 0 ? (stats.viva.totalSpeed / stats.viva.count).toFixed(2) : 0
            },
            wifi: stats.wifi,
            fourG: stats.fourG,
            threeG: stats.threeG
        };

        console.log('📊 Stats calculadas:', result);
        return result;
    };

    const onEachDistrict = (feature, layer) => {
        const { distrito, nombreciud, shapeName } = feature.properties;
        const displayName = shapeName || nombreciud || distrito || 'Distrito Desconocido';

        // Calcular estadísticas del distrito
        const stats = calculateDistrictStats(feature.geometry);

        console.log(`📊 Estadísticas para ${displayName}:`, stats);

        layer.bindPopup(`
            <div style="font-family: 'Inter', sans-serif; min-width: 280px;">
                <h3 style="margin: 0 0 12px 0; color: #22c55e; font-size: 16px; font-weight: 700; border-bottom: 2px solid #22c55e; padding-bottom: 8px;">
                    📍 ${displayName}
                </h3>
                
                <div style="background: #f8fafc; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                    <p style="margin: 4px 0; color: #1e293b; font-size: 13px; font-weight: 600;">
                        📊 Total de Señales: <span style="color: #22c55e;">${stats.total}</span>
                    </p>
                    <p style="margin: 4px 0; color: #1e293b; font-size: 12px;">
                        📶 Señal Promedio: <span style="color: ${stats.avgSignal >= -70 ? '#22c55e' : stats.avgSignal >= -85 ? '#eab308' : '#ef4444'};">${stats.avgSignal} dBm</span>
                    </p>
                    <p style="margin: 4px 0; color: #1e293b; font-size: 12px;">
                        🚀 Velocidad Promedio: <span style="color: #3b82f6;">${stats.avgSpeed} Mbps</span>
                    </p>
                </div>
                
                <h4 style="margin: 8px 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Por Operadora:
                </h4>
                <div style="background: #fee2e2; padding: 6px; border-radius: 4px; margin-bottom: 4px;">
                    <p style="margin: 2px 0; color: #7f1d1d; font-size: 11px; font-weight: 600;">
                        🔴 ENTEL: ${stats.entel.count} señales
                    </p>
                    ${stats.entel.count > 0 ? `
                    <p style="margin: 2px 0; color: #991b1b; font-size: 10px; padding-left: 16px;">
                        📶 ${stats.entel.avgSignal} dBm  |  🚀 ${stats.entel.avgSpeed} Mbps
                    </p>
                    ` : ''}
                </div>
                
                <div style="background: #dbeafe; padding: 6px; border-radius: 4px; margin-bottom: 4px;">
                    <p style="margin: 2px 0; color: #1e3a8a; font-size: 11px; font-weight: 600;">
                        🔵 TIGO: ${stats.tigo.count} señales
                    </p>
                    ${stats.tigo.count > 0 ? `
                    <p style="margin: 2px 0; color: #1e40af; font-size: 10px; padding-left: 16px;">
                        📶 ${stats.tigo.avgSignal} dBm  |  🚀 ${stats.tigo.avgSpeed} Mbps
                    </p>
                    ` : ''}
                </div>
                
                <div style="background: #dcfce7; padding: 6px; border-radius: 4px; margin-bottom: 8px;">
                    <p style="margin: 2px 0; color: #14532d; font-size: 11px; font-weight: 600;">
                        🟢 VIVA: ${stats.viva.count} señales
                    </p>
                    ${stats.viva.count > 0 ? `
                    <p style="margin: 2px 0; color: #166534; font-size: 10px; padding-left: 16px;">
                        📶 ${stats.viva.avgSignal} dBm  |  🚀 ${stats.viva.avgSpeed} Mbps
                    </p>
                    ` : ''}
                </div>
                
                <h4 style="margin: 8px 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Por Tipo de Red:
                </h4>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                        WiFi: ${stats.wifi}
                    </span>
                    <span style="background: #fef3c7; color: #78350f; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                        4G: ${stats.fourG}
                    </span>
                    <span style="background: #fed7aa; color: #7c2d12; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                        3G: ${stats.threeG}
                    </span>
                </div>
            </div>
        `);

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    };

    const onEachMunicipio = (feature, layer) => {
        const { municipal_id, intersects_with } = feature.properties;

        layer.bindPopup(`
            <div style="font-family: sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #10b981; font-size: 14px; font-weight: 600;">
                    Municipio
                </h3>
                <p style="margin: 4px 0; color: #333; font-size: 12px;">
                    <strong>ID:</strong> ${municipal_id}
                </p>
                <p style="margin: 4px 0; color: #333; font-size: 12px;">
                    <strong>Provincia:</strong> ${intersects_with}
                </p>
            </div>
        `);

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    };

    return (
        <div className="map-container">
            <MapContainer
                center={SANTA_CRUZ_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {/* Capa de distritos/provincias/zonas */}
                {shouldShowLayer && selectedFilters?.layer === 'distritos' && districtsData && (
                    <GeoJSON
                        key="districts"
                        data={districtsData}
                        style={getGeoStyle}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {shouldShowLayer && selectedFilters?.layer === 'provincias' && provincesData && (
                    <GeoJSON
                        key="provinces"
                        data={provincesData}
                        style={getGeoStyle}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {shouldShowLayer && selectedFilters?.layer === 'municipios' && municipiosData && (
                    <GeoJSON
                        key="municipios"
                        data={municipiosData}
                        style={getGeoStyle}
                        onEachFeature={onEachMunicipio}
                    />
                )}

                {shouldShowLayer && selectedFilters?.layer === 'zonas' && districtsData && (
                    <GeoJSON
                        key="zones"
                        data={districtsData}
                        style={getGeoStyle}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {/* Mapa de calor de señal/velocidad */}
                {showHeatmap && filteredHeatmap.length > 0 && (
                    <HeatmapLayer
                        heatmapData={filteredHeatmap}
                        metric={heatmapMetric}
                    />
                )}

                {filteredPoints.length > 0 && <MapBounds points={filteredPoints} />}

                {/* Capa de Clusters para puntos (Optimizado para 300k+) */}
                {filteredPoints.length > 0 && (
                    <ClusterLayer points={filteredPoints} />
                )}
            </MapContainer>

            <div className="map-legend" style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.85)',
                padding: '15px',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                zIndex: 1000,
                maxWidth: '250px'
            }}>
                <h4 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>📊 Intensidad de Señal</h4>

                {/* Escala de colores por señal */}
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#00ff00', boxShadow: '0 0 8px #00ff00' }}></div>
                        <span>Excelente (-40 a -60 dBm)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#7df900', boxShadow: '0 0 6px #7df900' }}></div>
                        <span>Muy Buena (-60 a -70 dBm)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ffff00', boxShadow: '0 0 6px #ffff00' }}></div>
                        <span>Buena (-70 a -80 dBm)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ff6600', boxShadow: '0 0 6px #ff6600' }}></div>
                        <span>Regular (-80 a -90 dBm)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ff0000', boxShadow: '0 0 8px #ff0000' }}></div>
                        <span>Pobre (&lt; -90 dBm)</span>
                    </div>
                </div>

                {/* Operadora seleccionada */}
                {selectedFilters?.selectedOperator && (
                    <div style={{
                        marginTop: '10px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: 'bold',
                        color: '#22c55e'
                    }}>
                        📡 Mostrando: {selectedFilters.selectedOperator}
                    </div>
                )}

                {selectedFilters?.layer && selectedFilters.layer !== 'none' && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '20px',
                                height: '2px',
                                background: selectedFilters.layer === 'municipios' ? '#059669' : '#22c55e'
                            }}></div>
                            <span style={{ textTransform: 'capitalize' }}>{selectedFilters.layer}</span>
                        </div>
                    </div>
                )}

                {/* Controles de Mapa de Calor */}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Mapa de Calor</h4>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showHeatmap}
                            onChange={(e) => setShowHeatmap(e.target.checked)}
                        />
                        <span>Mostrar</span>
                    </label>
                    {showHeatmap && (
                        <div style={{ marginLeft: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="heatmap-metric"
                                    checked={heatmapMetric === 'signal'}
                                    onChange={() => setHeatmapMetric('signal')}
                                />
                                <span>Señal</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="heatmap-metric"
                                    checked={heatmapMetric === 'speed'}
                                    onChange={() => setHeatmapMetric('speed')}
                                />
                                <span>Velocidad</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
