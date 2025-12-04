/**
 * App.jsx - Componente principal
 * Dashboard de análisis de señales de internet en Santa Cruz, Bolivia
 * Arquitectura: React + Spark ETL + Real-time WebSocket
 */
import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import FilterSidebar from './components/FilterSidebar';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import OperatorAnalysis from './components/OperatorAnalysis';
import DistrictCharts from './components/DistrictCharts';
import ApiService from './services/api';
import WebSocketService from './services/websocket';
import './index.css';

function App() {
  // Estado principal
  const [filterOptions, setFilterOptions] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    provincias: [],
    municipios: [],
    empresas: [],
    tipos_senal: []
  });
  const [stats, setStats] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Cargar opciones de filtros al iniciar y configurar auto-refresh
  useEffect(() => {
    loadFilterOptions();
    loadInitialData();
    setupWebSocket();

    // Auto-refresh cada 10 segundos para mostrar datos en tiempo real
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      loadData();
    }, 10000);

    return () => {
      WebSocketService.disconnect();
      clearInterval(refreshInterval);
    };
  }, []);

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [selectedFilters]);

  const loadFilterOptions = async () => {
    try {
      const response = await ApiService.getFilterOptions();
      if (response.success) {
        setFilterOptions(response);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Preparar filtros activos
      const activeFilters = {};
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          activeFilters[key] = value;
        }
      });

      // Cargar estadísticas agregadas
      const statsResponse = await ApiService.getAggregatedData(activeFilters);
      if (statsResponse.success) {
        setStats(statsResponse);
      }

      // Cargar puntos del mapa
      const mapFilters = {};
      if (activeFilters.provincias && activeFilters.provincias.length > 0) {
        mapFilters.provincia = activeFilters.provincias[0];
      }
      if (activeFilters.municipios && activeFilters.municipios.length > 0) {
        mapFilters.municipio = activeFilters.municipios[0];
      }

      const mapResponse = await ApiService.getMapPoints(mapFilters);
      if (mapResponse.success) {
        setMapPoints(mapResponse.points);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const setupWebSocket = () => {
    // Conectar WebSocket para datos en tiempo real
    WebSocketService.connect();

    // Listener para conexión
    WebSocketService.on('connected', () => {
      console.log('✓ WebSocket conectado');
      setWsConnected(true);
    });

    // Listener para desconexión
    WebSocketService.on('disconnected', () => {
      console.log('✗ WebSocket desconectado');
      setWsConnected(false);
    });

    // Listener para nuevos datos
    WebSocketService.on('update', (data) => {
      console.log('Nuevos datos recibidos:', data.length);
      // Recargar datos cuando lleguen actualizaciones
      loadData();
    });

    // Listener para nueva señal individual
    WebSocketService.on('new_signal', (signal) => {
      console.log('Nueva señal:', signal);
      // Agregar nueva señal al mapa si está en el filtro actual
      setMapPoints(prev => [...prev, {
        lat: signal.latitud,
        lng: signal.longitud,
        tipo_senal: signal.tipo_senal,
        empresa: signal.empresa,
        nivel_bateria: signal.nivel_bateria,
        provincia: signal.provincia,
        municipio: signal.municipio
      }]);
    });
  };

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
  };

  const refreshData = () => {
    if (WebSocketService.isConnected()) {
      const activeFilters = {};
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          activeFilters[key] = value;
        }
      });
      WebSocketService.requestRefresh(activeFilters);
    } else {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Cargando Dashboard...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Procesando datos con Apache Spark
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            Santa Cruz Internet Analytics
          </h1>
          <div className="header-stats">
            <div className={`status-indicator ${wsConnected ? 'online' : 'offline'}`}>
              {wsConnected ? 'En Vivo' : 'Desconectado'}
            </div>
            <div className="stat-badge">
              <span className="label">Última actualización:</span>
              <span className="value">
                {lastUpdate.toLocaleTimeString('es-BO')}
              </span>
            </div>
            <button
              onClick={refreshData}
              className="clear-filters-btn"
              style={{ padding: '0.5rem 1rem', width: 'auto' }}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div className="app-container">
        {/* Sidebar de filtros */}
        <FilterSidebar
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Contenido principal */}
        <main className="main-content">
          {/* Tarjetas de estadísticas */}
          <StatsCards stats={stats} />

          {/* Mapa */}
          <div className="mt-2">
            <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.5rem', fontWeight: '700' }}>
              🗺️ Mapa de Señales - Santa Cruz
            </h2>
            <MapView
              points={mapPoints}
              selectedFilters={selectedFilters}
              heatmapData={stats?.signal_heatmap || []}
            />
          </div>

          {/* Gráficos */}
          <div className="mt-2">
            <Charts stats={stats} />
          </div>

          {/* Análisis por Operadora */}
          <div className="mt-2">
            <OperatorAnalysis stats={stats} />
          </div>

          {/* Gráficas por Distrito */}
          <div className="mt-2">
            <DistrictCharts
              stats={stats}
              selectedOperator={selectedFilters.selectedOperator}
            />
          </div>

          {/* Footer con información */}
          <div className="mt-2 text-center" style={{
            padding: 'var(--spacing-lg)',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)'
          }}>
            <p>
              💡 <strong>Big Data Analytics</strong> |
              Powered by Apache Spark + React + FastAPI
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: 'var(--spacing-xs)' }}>
              Procesamiento en tiempo real de señales de internet en Santa Cruz, Bolivia
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
