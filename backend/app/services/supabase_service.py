"""
Cliente de Supabase para manejo de datos.
"""
from supabase import create_client, Client
from app.config import config
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class SupabaseService:
    """Servicio para interactuar con Supabase - KISS: operaciones esenciales."""
    
    def __init__(self):
        self.client: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_KEY
        )
        self.table_name = "locations"  # Tabla de ubicaciones/señales
    
    def get_all_signals(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Obtiene todas las señales con límite."""
        try:
            response = self.client.table(self.table_name)\
                .select("*")\
                .limit(limit)\
                .execute()
            # Normalizar tipos de datos para Spark
            return self._normalize_data(response.data)
        except Exception as e:
            logger.error(f"Error fetching signals: {e}")
            return []
    
    def _normalize_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normaliza tipos de datos para compatibilidad con Spark."""
        normalized = []
        for row in data:
            # Fil trar rows sin ubicación válida
            if not row.get('latitude') or not row.get('longitude'):
                continue
                
            normalized_row = {
                **row,
                'speed': float(row['speed']) if row.get('speed') is not None else 0.0,
                'altitude': float(row['altitude']) if row.get('altitude') is not None else 0.0,
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'battery': int(row['battery']) if row.get('battery') is not None else 0,
                'signal': int(row['signal']) if row.get('signal') is not None else 0,
                'sim_operator': str(row.get('sim_operator') or 'Unknown'),
                'network_type': str(row.get('network_type') or 'Unknown'),
                'device_name': str(row.get('device_name') or 'Unknown'),
            }
            normalized.append(normalized_row)
        return normalized
    
    def get_signals_with_filters(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Obtiene señales aplicando filtros."""
        try:
            query = self.client.table(self.table_name).select("*")
            
            # Aplicar filtros - usando nombres reales de columnas
            if filters.get("sim_operators"):
                query = query.in_("sim_operator", filters["sim_operators"])
            if filters.get("network_types"):
                query = query.in_("network_type", filters["network_types"])
            if filters.get("device_names"):
                query = query.in_("device_name", filters["device_names"])
            
            # Filtros de tiempo
            if filters.get("fecha_inicio"):
                query = query.gte("timestamp", filters["fecha_inicio"])
            if filters.get("fecha_fin"):
                query = query.lte("timestamp", filters["fecha_fin"])
            
            # Filtros numéricos
            if filters.get("battery_min"):
                query = query.gte("battery", filters["battery_min"])
            if filters.get("signal_min"):
                query = query.gte("signal", filters["signal_min"])
            
            response = query.limit(5000).execute()
            return self._normalize_data(response.data)
        except Exception as e:
            logger.error(f"Error fetching filtered signals: {e}")
            return []
    
    def subscribe_to_changes(self, callback):
        """Suscribe a cambios en tiempo real."""
        try:
            # Supabase realtime subscription
            self.client.table(self.table_name)\
                .on("INSERT", callback)\
                .subscribe()
        except Exception as e:
            logger.error(f"Error subscribing to changes: {e}")
    
    def get_unique_values(self, column: str) -> List[str]:
        """Obtiene valores únicos de una columna para filtros."""
        try:
            response = self.client.table(self.table_name)\
                .select(column)\
                .execute()
            
            values = set()
            for row in response.data:
                if row.get(column):
                    values.add(row[column])
            
            return sorted(list(values))
        except Exception as e:
            logger.error(f"Error fetching unique values for {column}: {e}")
            return []


# Singleton instance
supabase_service = SupabaseService()
