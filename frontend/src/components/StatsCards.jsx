/**
 * StatsCards Component - Tarjetas de estadísticas
 * Muestra métricas agregadas del sistema
 */
export default function StatsCards({ stats, mapPointsCount = 0 }) {
    if (!stats) {
        return (
            <div className="dashboard-grid">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-grid">
            {/* Puntos en el mapa */}
            <div className="dashboard-card">
                <div className="card-header">
                    <span className="card-title">📊 Total Señales</span>
                </div>
                <div className="card-value">
                    {mapPointsCount.toLocaleString()}
                </div>
                <div className="card-subtitle">Datos cargados en el mapa</div>
            </div>

            {/* Batería Promedio */}
            <div className="dashboard-card">
                <div className="card-header">
                    <span className="card-title">🔋 Batería Promedio</span>
                </div>
                <div className="card-value">
                    {(stats.average_battery || 0).toFixed(1)}%
                </div>
                <div className="card-subtitle">Nivel promedio de batería</div>
            </div>

            {/* Señales por Empresa */}
            <div className="dashboard-card">
                <div className="card-header">
                    <span className="card-title">🏢 Empresas</span>
                </div>
                <div className="card-value">
                    {Object.keys(stats.signals_by_company || {}).length}
                </div>
                <div className="card-subtitle">Proveedores activos</div>
            </div>

            {/* Tipos de Señal */}
            <div className="dashboard-card">
                <div className="card-header">
                    <span className="card-title">📡 Tipos de Señal</span>
                </div>
                <div className="card-value">
                    {Object.keys(stats.signals_by_type || {}).length}
                </div>
                <div className="card-subtitle">Tecnologías detectadas</div>
            </div>
        </div>
    );
}
