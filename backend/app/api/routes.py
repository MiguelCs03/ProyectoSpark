"""
Endpoints REST de la API.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from app.models.signal import FilterParams, AggregatedData
from app.services.supabase_service import supabase_service
from app.etl.spark_pipeline import spark_etl_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/signals")
async def get_signals(
    limit: int = Query(60000, description="Límite de registros"),
    provincia: Optional[str] = None,
    municipio: Optional[str] = None,
    empresa: Optional[str] = None,
    tipo_senal: Optional[str] = None
):
    """
    Obtiene señales con filtros opcionales.
    KISS: endpoint simple y directo.
    """
    try:
        filters = {}
        if provincia:
            filters["provincias"] = [provincia]
        if municipio:
            filters["municipios"] = [municipio]
        if empresa:
            filters["empresas"] = [empresa]
        if tipo_senal:
            filters["tipos_senal"] = [tipo_senal]
        
        if filters:
            data = supabase_service.get_signals_with_filters(filters)
        else:
            data = supabase_service.get_all_signals(limit)
        
        return {
            "success": True,
            "count": len(data),
            "data": data
        }
    except Exception as e:
        logger.error(f"Error in get_signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/aggregate")
async def get_aggregated_data(filters: FilterParams):
    """
    Procesa y agrega datos usando Spark ETL.
    """
    try:
        # Obtener datos de Supabase
        filter_dict = {k: v for k, v in filters.dict().items() if v is not None}
        
        if filter_dict:
            raw_data = supabase_service.get_signals_with_filters(filter_dict)
        else:
            raw_data = supabase_service.get_all_signals()
        
        if not raw_data:
            return {
                "success": True,
                "total_signals": 0,
                "average_battery": 0,
                "signals_by_company": {},
                "signals_by_type": {},
                "geographic_distribution": {}
            }
        
        # Procesar con Spark
        df = spark_etl_service.create_dataframe(raw_data)
        
        # Aplicar filtros adicionales si es necesario
        if filter_dict:
            df = spark_etl_service.filter_dataframe(df, filter_dict)
        
        # Calcular agregaciones
        stats = spark_etl_service.calculate_statistics(df)
        by_company = spark_etl_service.aggregate_by_company(df)
        by_type = spark_etl_service.aggregate_by_signal_type(df)
        by_geography = spark_etl_service.aggregate_by_geography(df)
        
        # Si no hay filtros, usar el conteo total real de la base de datos
        # Esto permite mostrar "600,000" señales aunque solo procesemos una muestra
        if not filter_dict:
            real_total = supabase_service.get_total_count()
            if real_total > 0:
                stats["total_signals"] = real_total
        
        return {
            "success": True,
            "total_signals": stats["total_signals"],
            "average_battery": stats["average_battery"],
            "signals_by_company": by_company,
            "signals_by_type": by_type,
            "geographic_distribution": by_geography,
            "statistics": stats
        }
    except Exception as e:
        logger.error(f"Error in get_aggregated_data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/map/points")
async def get_map_points(
    limit: int = Query(60000, description="Límite de puntos en el mapa"),
    provincia: Optional[str] = None,
    municipio: Optional[str] = None
):
    """
    Obtiene puntos geográficos para visualización en mapa.
    """
    try:
        filters = {}
        if provincia:
            filters["provincias"] = [provincia]
        if municipio:
            filters["municipios"] = [municipio]
        
        if filters:
            raw_data = supabase_service.get_signals_with_filters(filters)
        else:
            raw_data = supabase_service.get_all_signals(limit)
        
        # Procesar con Spark para optimizar
        df = spark_etl_service.create_dataframe(raw_data)
        points = spark_etl_service.get_geographic_points(df, limit)
        
        return {
            "success": True,
            "count": len(points),
            "points": points
        }
    except Exception as e:
        logger.error(f"Error in get_map_points: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/timeseries")
async def get_time_series(
    interval: str = Query("hour", description="Intervalo de tiempo: hour, day"),
    provincia: Optional[str] = None
):
    """
    Obtiene serie temporal de señales.
    """
    try:
        filters = {}
        if provincia:
            filters["provincias"] = [provincia]
        
        raw_data = supabase_service.get_signals_with_filters(filters) if filters else supabase_service.get_all_signals()
        
        df = spark_etl_service.create_dataframe(raw_data)
        time_series = spark_etl_service.time_series_aggregation(df, interval)
        
        return {
            "success": True,
            "interval": interval,
            "data": time_series
        }
    except Exception as e:
        logger.error(f"Error in get_time_series: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters/options")
async def get_filter_options():
    """
    Obtiene opciones disponibles para filtros.
    YAGNI: solo valores únicos necesarios para los filtros.
    """
    try:
        provincias = supabase_service.get_unique_values("provincia")
        municipios = supabase_service.get_unique_values("municipio")
        empresas = supabase_service.get_unique_values("empresa")
        tipos_senal = supabase_service.get_unique_values("tipo_senal")
        
        return {
            "success": True,
            "provincias": provincias,
            "municipios": municipios,
            "empresas": empresas,
            "tipos_senal": tipos_senal
        }
    except Exception as e:
        logger.error(f"Error in get_filter_options: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Santa Cruz Signal Analytics API"
    }
