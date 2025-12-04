/**
 * OperatorAnalysis Component - Análisis detallado por operadora
 * Muestra velocidad, cobertura y calidad de señal por operador
 */
export default function OperatorAnalysis({ stats }) {
    if (!stats || !stats.speed_by_operator) {
        return null;
    }

    const operators = stats.speed_by_operator;
    const coverage = stats.coverage_analysis || {};

    // Colores por operadora
    const operatorColors = {
        'ENTEL': '#ef4444',
        'Entel': '#ef4444',
        'TIGO': '#3b82f6',
        'VIVA': '#10b981',
        'Movil GSM': '#f59e0b'
    };

    const getOperatorColor = (op) => {
        return operatorColors[op] || '#6b7280';
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
            }}>
                📊 Análisis por Operadora
            </h2>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {Object.entries(operators).map(([operator, data]) => {
                    const coverageData = coverage[operator] || {};
                    const color = getOperatorColor(operator);

                    return (
                        <div key={operator} className="dashboard-card" style={{
                            borderLeft: `4px solid ${color}`
                        }}>
                            <div className="card-header">
                                <span className="card-title" style={{ color }}>
                                    📡 {operator}
                                </span>
                            </div>

                            <div style={{ padding: '1rem 0' }}>
                                {/* Velocidad Promedio */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Velocidad Promedio
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {data.avg_speed.toFixed(2)} <span style={{ fontSize: '0.875rem' }}>m/s</span>
                                    </div>
                                </div>

                                {/* Rango de Velocidad */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem',
                                    padding: '0.5rem',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '4px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Mín
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {data.min_speed.toFixed(1)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Máx
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {data.max_speed.toFixed(1)}
                                        </div>
                                    </div>
                                </div>

                                {/* Cobertura */}
                                {coverageData.unique_locations && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            Puntos de Cobertura
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {coverageData.unique_locations.toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {/* Calidad de Señal */}
                                {coverageData.avg_signal && (
                                    <div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            Señal Promedio
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: coverageData.avg_signal > -70 ? '#10b981' :
                                                coverageData.avg_signal > -85 ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {coverageData.avg_signal.toFixed(0)} dBm
                                        </div>
                                    </div>
                                )}

                                {/* Total de Mediciones */}
                                <div style={{
                                    marginTop: '1rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid var(--border-color)',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {data.total.toLocaleString()} mediciones
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
