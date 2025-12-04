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

    const onEachDistrict = (feature, layer) => {
        const { distrito, nombreciud, poblacion, viviendas } = feature.properties;

        layer.bindPopup(`
            <div style="font-family: sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #22c55e; font-size: 14px; font-weight: 600;">
                    ${nombreciud}
                </h3>
                <p style="margin: 4px 0; color: #333; font-size: 12px;">
                    <strong>Distrito:</strong> ${distrito}
                </p>
                <p style="margin: 4px 0; color: #333; font-size: 12px;">
                    <strong>Población:</strong> ${parseInt(poblacion).toLocaleString()}
                </p>
                <p style="margin: 4px 0; color: #333; font-size: 12px;">
                    <strong>Viviendas:</strong> ${parseInt(viviendas).toLocaleString()}
                </p>
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
