"""
Modelos de datos para el sistema de análisis de señales.
Siguiendo principios KISS: modelos simples y claros.
Adaptado a la estructura real de la base de datos.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SignalData(BaseModel):
    """Modelo base para datos de señal de internet."""
    id: Optional[int] = None
    device_id: Optional[str] = Field(None, description="ID del dispositivo")
    device_name: Optional[str] = Field(None, description="Nombre del dispositivo")
    latitude: float = Field(..., description="Latitud de la señal")
    longitude: float = Field(..., description="Longitud de la señal")
    altitude: Optional[float] = Field(None, description="Altura en metros")
    network_type: str = Field(..., description="Tipo de red (WiFi, Mobile, etc.)")
    sim_operator: str = Field(..., description="Operador de SIM")
    battery: Optional[int] = Field(None, description="Nivel de batería")
    signal: Optional[int] = Field(None, description="Intensidad de señal")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class FilterParams(BaseModel):
    """Parámetros de filtrado - YAGNI: solo lo necesario."""
    sim_operators: Optional[List[str]] = None
    network_types: Optional[List[str]] = None
    device_names: Optional[List[str]] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    battery_min: Optional[int] = None
    signal_min: Optional[int] = None


class AggregatedData(BaseModel):
    """Datos agregados para visualización."""
    total_signals: int
    average_battery: float
    average_signal: float
    signals_by_operator: dict
    signals_by_type: dict
    signals_by_device: dict

