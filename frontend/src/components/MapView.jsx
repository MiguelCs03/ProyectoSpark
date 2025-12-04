/**
 * Map Component - Mapa interactivo con Leaflet
 * Visualiza puntos de señales en Santa Cruz
 */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, useMap } from 'react-leaflet';
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

    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = points.map(p => [p.lat, p.lng]);
            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        }
    }, [points, map]);

    return null;
}

export default function MapView({ points = [], selectedFilters }) {
    const [districtsData, setDistrictsData] = useState(null);

    // Cargar datos de distritos
    useEffect(() => {
        fetch('/santa-cruz-districts.geojson')
            .then(response => response.json())
            .then(data => setDistrictsData(data))
            .catch(error => console.error('Error loading districts:', error));
    }, []);

    const getMarkerColor = (tipoSenal) => {
        return SIGNAL_COLORS[tipoSenal] || SIGNAL_COLORS.default;
    };

    const getMarkerSize = (nivelBateria) => {
        // Tamaño basado en nivel de batería
        if (nivelBateria >= 80) return 8;
        if (nivelBateria >= 50) return 6;
        return 4;
    };

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
                {districtsData && shouldShowLayer && (
                    <GeoJSON
                        key={selectedFilters?.layer} // Forzar re-render al cambiar capa
                        data={districtsData}
                        style={getGeoStyle}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {points.length > 0 && <MapBounds points={points} />}

                {points.map((point, index) => (
                    <CircleMarker
                        key={`marker-${index}`}
                        center={[point.lat, point.lng]}
                        radius={getMarkerSize(point.nivel_bateria || 50)}
                        fillColor={getMarkerColor(point.tipo_senal)}
                        color="#fff"
                        weight={1}
                        opacity={0.9}
                        fillOpacity={0.7}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                                    📡 {point.tipo_senal}
                                </h3>
                                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                    <p><strong>Empresa:</strong> {point.empresa}</p>
                                    <p><strong>Provincia:</strong> {point.provincia || 'N/A'}</p>
                                    <p><strong>Municipio:</strong> {point.municipio || 'N/A'}</p>
                                    <p><strong>Batería:</strong> {point.nivel_bateria}%</p>
                                    <p><strong>Coordenadas:</strong></p>
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        Lat: {point.lat.toFixed(5)}<br />
                                        Lng: {point.lng.toFixed(5)}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            <div className="map-legend" style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '15px',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                zIndex: 1000
            }}>
                <h4 style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Tipo de Señal</h4>
                {Object.entries(SIGNAL_COLORS).filter(([key]) => key !== 'default').map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }}></div>
                        <span>{type}</span>
                    </div>
                ))}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '2px', background: '#22c55e' }}></div>
                        <span>Distritos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
