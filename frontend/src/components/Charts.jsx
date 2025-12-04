/**
 * Charts Component - Gráficos con Recharts
 * Visualizaciones de datos agregados
 */
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Charts({ stats }) {
    if (!stats) return null;

    // Preparar datos para gráfico de empresas
    const companyData = Object.entries(stats.signals_by_company || {}).map(([name, value]) => ({
        name,
        value
    }));

    // Preparar datos para gráfico de tipos de señal
    const signalTypeData = Object.entries(stats.signals_by_type || {}).map(([name, value]) => ({
        name,
        value
    }));

    // Preparar datos geográficos (provincias)
    const geographicData = Object.entries(stats.geographic_distribution?.provincias || {}).map(([name, value]) => ({
        name,
        value
    }));

    return (
        <div>
            {/* Gráfico de Empresas */}
            {companyData.length > 0 && (
                <div className="chart-container">
                    <h3 className="chart-title">📊 Señales por Empresa</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={companyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                                contentStyle={{ background: '#1a1f2e', border: '1px solid #333', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill="#22c55e" name="Cantidad de Señales" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Gráficos de Pie */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Tipo de Señal */}
                {signalTypeData.length > 0 && (
                    <div className="chart-container">
                        <h3 className="chart-title">📡 Distribución por Tipo de Señal</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={signalTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {signalTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1a1f2e', border: '1px solid #333', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Distribución Geográfica */}
                {geographicData.length > 0 && (
                    <div className="chart-container">
                        <h3 className="chart-title">🗺️ Distribución por Provincia</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={geographicData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {geographicData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1a1f2e', border: '1px solid #333', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
