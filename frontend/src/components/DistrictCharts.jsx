/**
 * DistrictCharts - Gráficas dinámicas por distrito
 * Muestra análisis de operadoras y tipos de red por zona geográfica
 */
import { useMemo } from 'react';

export default function DistrictCharts({ stats, selectedOperator }) {
    if (!stats || !stats.district_analysis) {
        return null;
    }

    const districts = stats.district_analysis.districts || [];

    // Filtrar por operadora si está seleccionada
    const filteredDistricts = useMemo(() => {
        if (!selectedOperator) return districts;

        return districts.filter(d => {
            const operatorCount = d.operators[selectedOperator] || 0;
            return operatorCount > 0;
        });
    }, [districts, selectedOperator]);

    // Calcular totales por operadora (de los distritos filtrados)
    const operatorTotals = useMemo(() => {
        const totals = { ENTEL: 0, TIGO: 0, VIVA: 0 };
        filteredDistricts.forEach(d => {
            totals.ENTEL += d.operators.ENTEL || 0;
            totals.TIGO += d.operators.TIGO || 0;
            totals.VIVA += d.operators.VIVA || 0;
        });
        return totals;
    }, [filteredDistricts]);

    // Calcular totales por tipo de red
    const networkTotals = useMemo(() => {
        const totals = { WiFi: 0, '4G': 0, '3G': 0 };
        filteredDistricts.forEach(d => {
            totals.WiFi += d.network_types.WiFi || 0;
            totals['4G'] += d.network_types['4G'] || 0;
            totals['3G'] += d.network_types['3G'] || 0;
        });
        return totals;
    }, [filteredDistricts]);

    const totalSignals = operatorTotals.ENTEL + operatorTotals.TIGO + operatorTotals.VIVA;
    const totalNetworkSignals = networkTotals.WiFi + networkTotals['4G'] + networkTotals['3G'];

    // Top 10 distritos
    const topDistricts = filteredDistricts.slice(0, 10);
    const maxSignals = Math.max(...topDistricts.map(d => d.total_signals), 1);

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
            }}>
                📊 Análisis por Distrito {selectedOperator && `- ${selectedOperator}`}
            </h2>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>

                {/* Gráfico de Operadoras */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <span className="card-title">Distribución por Operadora</span>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        {Object.entries(operatorTotals).map(([operator, count]) => {
                            const percentage = totalSignals > 0 ? (count / totalSignals * 100) : 0;
                            const color = operator === 'ENTEL' ? '#ff0000' :
                                operator === 'TIGO' ? '#0066ff' : '#00ff00';

                            return (
                                <div key={operator} style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ fontWeight: '600' }}>{operator}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '24px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: color,
                                            boxShadow: `0 0 12px ${color}`,
                                            transition: 'width 0.5s ease',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            paddingRight: '8px',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '12px'
                                        }}>
                                            {percentage > 10 && `${percentage.toFixed(0)}%`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Gráfico de Tipos de Red */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <span className="card-title">Distribución por Tipo de Red</span>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        {Object.entries(networkTotals).map(([network, count]) => {
                            const percentage = totalNetworkSignals > 0 ? (count / totalNetworkSignals * 100) : 0;
                            const color = network === 'WiFi' ? '#8b5cf6' :
                                network === '4G' ? '#3b82f6' : '#f59e0b';

                            return (
                                <div key={network} style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ fontWeight: '600' }}>{network}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '24px',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: color,
                                            boxShadow: `0 0 8px ${color}`,
                                            transition: 'width 0.5s ease',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            paddingRight: '8px',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '12px'
                                        }}>
                                            {percentage > 10 && `${percentage.toFixed(0)}%`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Distritos por Señales */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <span className="card-title">🏆 Top 10 Zonas por Actividad</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {topDistricts.map((district, index) => (
                        <div key={district.district_id} style={{
                            marginBottom: '1.5rem',
                            paddingBottom: '1rem',
                            borderBottom: index < topDistricts.length - 1 ? '1px solid var(--border-color)' : 'none'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <div>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        marginRight: '0.5rem',
                                        color: index < 3 ? '#f59e0b' : 'var(--text-secondary)'
                                    }}>
                                        #{index + 1}
                                    </span>
                                    <span style={{ fontWeight: '600' }}>
                                        Zona {district.coordinates.lat.toFixed(2)}, {district.coordinates.lng.toFixed(2)}
                                    </span>
                                </div>
                                <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                                    {district.total_signals.toLocaleString()} señales
                                </span>
                            </div>

                            {/* Barra de progreso */}
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{
                                    width: `${(district.total_signals / maxSignals * 100)}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                    borderRadius: '4px'
                                }}></div>
                            </div>

                            {/* Métricas del distrito */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)'
                            }}>
                                <div>
                                    <strong>Señal:</strong> {district.avg_signal.toFixed(1)} dBm
                                </div>
                                <div>
                                    <strong>Velocidad:</strong> {district.avg_speed.toFixed(2)} m/s
                                </div>
                                <div style={{ color: '#ff0000', fontWeight: '600' }}>
                                    ENTEL: {district.operators.ENTEL}
                                </div>
                                <div style={{ color: '#0066ff', fontWeight: '600' }}>
                                    TIGO: {district.operators.TIGO}
                                </div>
                                <div style={{ color: '#00ff00', fontWeight: '600' }}>
                                    VIVA: {district.operators.VIVA}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
