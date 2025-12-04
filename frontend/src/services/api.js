/**
 * API Service - Cliente HTTP para comunicación con backend
 * Siguiendo KISS: métodos simples y directos
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Obtener todas las señales
    async getSignals(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await this.client.get(`/signals?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching signals:', error);
            throw error;
        }
    }

    // Obtener datos agregados
    async getAggregatedData(filters = {}) {
        try {
            const response = await this.client.post('/analytics/aggregate', filters);
            return response.data;
        } catch (error) {
            console.error('Error fetching aggregated data:', error);
            throw error;
        }
    }

    // Obtener puntos para el mapa
    async getMapPoints(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.provincia) params.append('provincia', filters.provincia);
            if (filters.municipio) params.append('municipio', filters.municipio);

            const response = await this.client.get(`/map/points?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching map points:', error);
            throw error;
        }
    }

    // Obtener serie temporal
    async getTimeSeries(interval = 'hour', provincia = null) {
        try {
            const params = new URLSearchParams({ interval });
            if (provincia) params.append('provincia', provincia);

            const response = await this.client.get(`/analytics/timeseries?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching time series:', error);
            throw error;
        }
    }

    // Obtener opciones de filtros
    async getFilterOptions() {
        try {
            const response = await this.client.get('/filters/options');
            return response.data;
        } catch (error) {
            console.error('Error fetching filter options:', error);
            throw error;
        }
    }
}

export default new ApiService();
