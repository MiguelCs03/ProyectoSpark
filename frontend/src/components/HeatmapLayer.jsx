/**
 * HeatmapLayer Component - Capa de mapa de calor para señal/velocidad
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ heatmapData, metric = 'signal' }) {
    const map = useMap();

    useEffect(() => {
        if (!heatmapData || heatmapData.length === 0) return;

        // Preparar datos para el mapa de calor
        const heatData = heatmapData.map(point => {
            // Normalizar el valor según la métrica
            let intensity;
            if (metric === 'signal') {
                // Señal: -40 (excelente) a -100 (pobre)
                // Normalizar a 0-1
                intensity = Math.max(0, Math.min(1, (point.signal + 100) / 60));
            } else if (metric === 'speed') {
                // Velocidad: normalizar basado en máximo esperado de 50 m/s
                intensity = Math.min(1, point.speed / 50);
            } else {
                intensity = 0.5;
            }

            return [point.lat, point.lng, intensity];
        });

        // Crear capa de mapa de calor
        const heatLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 35,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: '#3b82f6',  // Azul (bajo)
                0.3: '#10b981',  // Verde
                0.5: '#f59e0b',  // Amarillo
                0.7: '#ef4444',  // Rojo
                1.0: '#dc2626'   // Rojo oscuro (alto)
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, heatmapData, metric]);

    return null;
}
