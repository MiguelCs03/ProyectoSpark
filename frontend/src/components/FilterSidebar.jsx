/**
 * FilterSidebar Component - Panel de filtros dinámico
 * KISS: Filtros simples y efectivos
 */
import { useState, useEffect } from 'react';

export default function FilterSidebar({
    filterOptions,
    onFilterChange,
    selectedFilters
}) {
    const [localFilters, setLocalFilters] = useState({
        provincias: [],
        municipios: [],
        empresas: [],
        tipos_senal: []
    });

    useEffect(() => {
        if (selectedFilters) {
            setLocalFilters(selectedFilters);
        }
    }, [selectedFilters]);

    const handleCheckboxChange = (category, value) => {
        const updatedCategory = localFilters[category].includes(value)
            ? localFilters[category].filter(item => item !== value)
            : [...localFilters[category], value];

        const updatedFilters = {
            ...localFilters,
            [category]: updatedCategory
        };

        setLocalFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const clearAllFilters = () => {
        const emptyFilters = {
            provincias: [],
            municipios: [],
            empresas: [],
            tipos_senal: []
        };
        setLocalFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const hasActiveFilters = Object.values(localFilters).some(arr => arr.length > 0);

    return (
        <div className="sidebar">
            <h2>Panel de Control</h2>

            {/* Divisiones Geográficas */}
            <div className="filter-group">
                <h3>🗺️ Divisiones Geográficas</h3>
                <div className="filter-options">
                    <div className="filter-checkbox">
                        <input
                            type="radio"
                            id="layer-none"
                            name="geo-layer"
                            defaultChecked
                            onChange={() => onFilterChange({ ...localFilters, layer: 'none' })}
                        />
                        <label htmlFor="layer-none">Ninguna</label>
                    </div>
                    <div className="filter-checkbox">
                        <input
                            type="radio"
                            id="layer-distritos"
                            name="geo-layer"
                            onChange={() => onFilterChange({ ...localFilters, layer: 'distritos' })}
                        />
                        <label htmlFor="layer-distritos">Distritos</label>
                    </div>
                    <div className="filter-checkbox">
                        <input
                            type="radio"
                            id="layer-provincias"
                            name="geo-layer"
                            onChange={() => onFilterChange({ ...localFilters, layer: 'provincias' })}
                        />
                        <label htmlFor="layer-provincias">Provincias</label>
                    </div>
                    <div className="filter-checkbox">
                        <input
                            type="radio"
                            id="layer-zonas"
                            name="geo-layer"
                            onChange={() => onFilterChange({ ...localFilters, layer: 'zonas' })}
                        />
                        <label htmlFor="layer-zonas">Zonas</label>
                    </div>
                </div>
            </div>

            <h3 style={{ marginTop: '20px' }}>Filtros de Datos</h3>

            {/* Provincias */}
            <div className="filter-group">
                <h3>📍 Provincias</h3>
                <div className="filter-options">
                    {filterOptions?.provincias?.map(provincia => (
                        <div key={provincia} className="filter-checkbox">
                            <input
                                type="checkbox"
                                id={`provincia-${provincia}`}
                                checked={localFilters.provincias.includes(provincia)}
                                onChange={() => handleCheckboxChange('provincias', provincia)}
                            />
                            <label htmlFor={`provincia-${provincia}`}>{provincia}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Municipios */}
            <div className="filter-group">
                <h3>🏙️ Municipios</h3>
                <div className="filter-options">
                    {filterOptions?.municipios?.map(municipio => (
                        <div key={municipio} className="filter-checkbox">
                            <input
                                type="checkbox"
                                id={`municipio-${municipio}`}
                                checked={localFilters.municipios.includes(municipio)}
                                onChange={() => handleCheckboxChange('municipios', municipio)}
                            />
                            <label htmlFor={`municipio-${municipio}`}>{municipio}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empresas */}
            <div className="filter-group">
                <h3>🏢 Empresas</h3>
                <div className="filter-options">
                    {filterOptions?.empresas?.map(empresa => (
                        <div key={empresa} className="filter-checkbox">
                            <input
                                type="checkbox"
                                id={`empresa-${empresa}`}
                                checked={localFilters.empresas.includes(empresa)}
                                onChange={() => handleCheckboxChange('empresas', empresa)}
                            />
                            <label htmlFor={`empresa-${empresa}`}>{empresa}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tipos de Señal */}
            <div className="filter-group">
                <h3>📡 Tipo de Señal</h3>
                <div className="filter-options">
                    {filterOptions?.tipos_senal?.map(tipo => (
                        <div key={tipo} className="filter-checkbox">
                            <input
                                type="checkbox"
                                id={`tipo-${tipo}`}
                                checked={localFilters.tipos_senal.includes(tipo)}
                                onChange={() => handleCheckboxChange('tipos_senal', tipo)}
                            />
                            <label htmlFor={`tipo-${tipo}`}>{tipo}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
                <button
                    className="clear-filters-btn"
                    onClick={clearAllFilters}
                >
                    🗑️ Limpiar Filtros
                </button>
            )}
        </div>
    );
}
