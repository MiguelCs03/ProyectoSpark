import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster';

// Función para obtener color basado en intensidad de señal
const getSignalColor = (signal) => {
    if (signal >= -60) return '#00ff00';  // Verde neón - Excelente
    if (signal >= -70) return '#7df900';  // Verde lima - Muy buena
    if (signal >= -80) return '#ffff00';  // Amarillo puro - Buena
    if (signal >= -90) return '#ff6600';  // Naranja intenso - Regular
    return '#ff0000';  // Rojo puro - Pobre
};

export default function ClusterLayer({ points }) {
    const map = useMap();
    const markerClusterGroupRef = useRef(null);
    const renderedPointsCountRef = useRef(0);

    // Inicializar el grupo de clusters una sola vez
    useEffect(() => {
        const markers = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 80,
            disableClusteringAtZoom: 16
        });
        
        markerClusterGroupRef.current = markers;
        map.addLayer(markers);

        return () => {
            map.removeLayer(markers);
            markerClusterGroupRef.current = null;
        };
    }, [map]);

    // Actualizar marcadores cuando cambian los puntos
    useEffect(() => {
        const markers = markerClusterGroupRef.current;
        if (!markers) return;

        // Si no hay puntos, limpiar todo
        if (!points || points.length === 0) {
            markers.clearLayers();
            renderedPointsCountRef.current = 0;
            return;
        }

        // Detectar si es una carga incremental (append) o nuevos datos
        const isIncremental = points.length > renderedPointsCountRef.current && renderedPointsCountRef.current > 0;
        
        // Si es incremental, solo agregamos los nuevos
        // Si no (filtro nuevo o reset), limpiamos y agregamos todo
        let pointsToAdd = [];
        
        if (isIncremental) {
            // Agregar solo los nuevos puntos
            pointsToAdd = points.slice(renderedPointsCountRef.current);
        } else {
            // Reset completo
            markers.clearLayers();
            pointsToAdd = points;
        }

        // Crear marcadores para los puntos a agregar
        const newMarkers = pointsToAdd.map(point => {
            const color = getSignalColor(point.signal || -80);
            
            // Usar latitude/longitude que vienen del backend
            const lat = point.latitude || point.lat;
            const lng = point.longitude || point.lng;

            if (!lat || !lng) return null;

            const marker = L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: color,
                color: "#fff",
                weight: 1,
                opacity: 0.9,
                fillOpacity: 0.8
            });

            const popupContent = `
                <div style="min-width: 200px; font-family: sans-serif;">
                    <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: ${color}">
                        📡 ${point.sim_operator || 'Unknown'}
                    </h3>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <p><strong>Tipo:</strong> ${point.network_type || 'N/A'}</p>
                        <p><strong>Dispositivo:</strong> ${point.device_name || 'N/A'}</p>
                        <p style="color: ${color}; font-weight: bold;">
                            <strong>Señal:</strong> ${point.signal || 'N/A'} dBm
                        </p>
                        <p><strong>Velocidad:</strong> ${point.speed ? point.speed.toFixed(2) : 'N/A'} m/s</p>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            return marker;
        }).filter(m => m !== null);

        if (newMarkers.length > 0) {
            markers.addLayers(newMarkers);
        }
        
        renderedPointsCountRef.current = points.length;

    }, [points]);

    return null;
}
