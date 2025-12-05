/**
 * App.jsx - Componente principal
 * Dashboard de análisis de señales de internet en Santa Cruz, Bolivia
 * Arquitectura: React + Spark ETL + Real-time WebSocket
 */
import { useState, useEffect, useRef } from 'react';
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
  const mapPointsRef = useRef([]); // Ref para acceder al estado actual en closures (WebSocket)

  useEffect(() => {
    mapPointsRef.current = mapPoints;
  }, [mapPoints]);

  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Control de carga incremental
  const loadIdRef = useRef(0);
  const lastOffsetRef = useRef(0); // Tracking del último offset cargado

  // Cargar opciones de filtros al iniciar y configurar auto-refresh
  useEffect(() => {
    loadFilterOptions();
    loadInitialData();
    setupWebSocket();

    // Auto-refresh cada 10 segundos para cargar más datos incrementalmente
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      loadData(true); // true = modo actualización (append)
    }, 10000);

    return () => {
      WebSocketService.disconnect();
      clearInterval(refreshInterval);
    };
  }, []);

  // NO recargar datos cuando cambien los filtros - solo refrescar stats
  useEffect(() => {
    if (!loading && selectedFilters) {
      // Solo recargar estadísticas, NO los puntos del mapa
      loadStats();
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

  const loadStats = async () => {
    try {
      // Preparar filtros activos
      const activeFilters = {};
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          activeFilters[key] = value;
        }
      });

      console.log('📊 Recargando solo estadísticas...');
      const statsResponse = await ApiService.getAggregatedData(activeFilters);
      if (statsResponse.success) {
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadData = async (isUpdate = false) => {
    try {
      // Incrementar ID de carga para invalidar cargas anteriores
      const currentLoadId = ++loadIdRef.current;

      // Preparar filtros activos
      const activeFilters = {};
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value && value.length > 0) {
          activeFilters[key] = value;
        }
      });

      // Cargar estadísticas agregadas
      console.log('🔄 Cargando datos agregados...');
      console.log('Filtros activos:', activeFilters);

      const statsResponse = await ApiService.getAggregatedData(activeFilters);
      console.log('📊 Respuesta de estadísticas:', statsResponse);

      if (statsResponse.success) {
        console.log('✅ Datos de stats recibidos:', {
          total_signals: statsResponse.total_signals,
          signals_by_company: statsResponse.signals_by_company,
          signal_heatmap: statsResponse.signal_heatmap?.length || 0
        });
        setStats(statsResponse);
      } else {
        console.error('❌ Error: statsResponse.success is false');
      }

      // Cargar puntos del mapa
      const mapFilters = {};
      if (activeFilters.provincias && activeFilters.provincias.length > 0) {
        mapFilters.provincia = activeFilters.provincias[0];
      }
      if (activeFilters.municipios && activeFilters.municipios.length > 0) {
        mapFilters.municipio = activeFilters.municipios[0];
      }

      // Si hay filtros activos, cargar normal (menos datos)
      if (Object.keys(mapFilters).length > 0) {
        const mapResponse = await ApiService.getSignals(mapFilters);
        if (mapResponse.success) {
          if (currentLoadId === loadIdRef.current) {
            setMapPoints(mapResponse.data);
          }
        }
      } else {
        // Carga incremental para todos los datos
        let offset = lastOffsetRef.current; // Empezar desde el último offset

        if (isUpdate && currentLoadId === loadIdRef.current) {
          // Si es actualización, continuar desde donde quedamos
          console.log(`📊 Actualizando datos: continuando desde offset ${offset}`);
        } else if (currentLoadId === loadIdRef.current) {
          // Si es carga nueva, resetear
          setMapPoints([]);
          offset = 0;
          lastOffsetRef.current = 0;
          console.log('🔄 Reiniciando carga desde 0');
        }

        const limit = 25000; // Cargar 25000 registros por vez
        let hasMore = true;

        const loadChunk = async () => {
          // Verificar si esta carga sigue siendo válida
          if (currentLoadId !== loadIdRef.current) return;
          if (!hasMore) return;

          console.log(`📦 Cargando chunk: offset=${offset}, limit=${limit}`);
          const response = await ApiService.getSignals({}, offset, limit);

          // Verificar nuevamente después del await
          if (currentLoadId !== loadIdRef.current) return;

          if (response.success && response.data.length > 0) {
            setMapPoints(prev => [...prev, ...response.data]);
            offset += response.data.length; // Usar la cantidad real recibida
            lastOffsetRef.current = offset; // Guardar el offset actual

            console.log(`✅ Cargados ${response.data.length} registros. Total acumulado: ${offset}`);

            // Si recibimos menos del límite, es el último chunk
            if (response.data.length < limit) {
              hasMore = false;
              console.log('✅ Carga completa finalizada');
            } else {
              // Programar siguiente chunk en 2 segundos
              setTimeout(loadChunk, 2000);
            }
          } else {
            hasMore = false;
          }
        };

        // Iniciar carga incremental
        loadChunk();
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
      // Recargar datos cuando lleguen actualizaciones (modo append)
      loadData(true);
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
      loadData(true); // true = modo actualización (append)
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
          <StatsCards stats={stats} mapPointsCount={mapPoints.length} />

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
