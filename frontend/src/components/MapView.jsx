/**
 * Map Component - Mapa interactivo con Leaflet
 * Visualiza puntos de señales en Santa Cruz
 */
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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
    const getMarkerColor = (tipoSenal) => {
        return SIGNAL_COLORS[tipoSenal] || SIGNAL_COLORS.default;
    };

    const getMarkerSize = (nivelBateria) => {
        // Tamaño basado en nivel de batería
        if (nivelBateria >= 80) return 8;
        if (nivelBateria >= 50) return 6;
        return 4;
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
            </div>
        </div>
    );
}
