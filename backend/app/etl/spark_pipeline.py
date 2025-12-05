"""
ETL Pipeline usando Apache Spark.
Procesa datos de señales para análisis y agregaciones.
"""
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, TimestampType
from typing import List, Dict, Any
import logging
import tempfile
import json
import os

logger = logging.getLogger(__name__)


class SparkETLService:
    """Servicio ETL con Spark - YAGNI: solo transformaciones necesarias."""
    
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("SantaCruzSignalETL") \
            .master("local[*]") \
            .config("spark.driver.memory", "4g") \
            .config("spark.executor.memory", "4g") \
            .config("spark.sql.execution.arrow.pyspark.enabled", "true") \
            .getOrCreate()
        
        self.spark.sparkContext.setLogLevel("WARN")
    
    def create_dataframe(self, data: List[Dict[str, Any]]) -> DataFrame:
        """Crea DataFrame de Spark desde datos de Supabase."""
        if not data:
            return self.spark.createDataFrame([], self._get_schema())
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json', encoding='utf-8') as tmp:
                for row in data:
                    tmp.write(json.dumps(row) + '\n')
                tmp_path = tmp.name
            
            logger.info(f"Data written to temp file: {tmp_path}")
            
            # Leer con Spark
            df = self.spark.read.json(tmp_path)
            
            # Forzar la lectura para asegurar que el archivo se procesa
            # Esto evita problemas de lazy evaluation si el archivo se borra o bloquea
            df.cache()
            count = df.count()
            logger.info(f"DataFrame created with {count} rows from temp file")
            
            return df

        except Exception as e:
            logger.error(f"Error creating DataFrame via temp file: {e}")
            try:
                return self.spark.createDataFrame(data)
            except Exception as e2:
                logger.error(f"Error creating DataFrame directly: {e2}")
                return self.spark.createDataFrame([], self._get_schema())
    
    def _get_schema(self) -> StructType:
        """Define schema de los datos - KISS: campos esenciales."""
        return StructType([
            StructField("id", IntegerType(), True),
            StructField("device_id", StringType(), True),
            StructField("device_name", StringType(), True),
            StructField("latitude", DoubleType(), True),
            StructField("longitude", DoubleType(), True),
            StructField("altitude", DoubleType(), True),
            StructField("speed", DoubleType(), True),
            StructField("battery", IntegerType(), True),
            StructField("signal", IntegerType(), True),
            StructField("sim_operator", StringType(), True),
            StructField("network_type", StringType(), True),
            StructField("timestamp", StringType(), True),  # Cambiado a String para evitar errores de parseo
        ])
    
    def aggregate_by_company(self, df: DataFrame) -> Dict[str, int]:
        """Agrega señales por operador."""
        result = df.groupBy("sim_operator").count().collect()
        return {row["sim_operator"]: row["count"] for row in result if row["sim_operator"]}
    
    def aggregate_by_signal_type(self, df: DataFrame) -> Dict[str, int]:
        """Agrega señales por tipo de red."""
        result = df.groupBy("network_type").count().collect()
        return {row["network_type"]: row["count"] for row in result if row["network_type"]}
    
    def aggregate_by_geography(self, df: DataFrame) -> Dict[str, Any]:
        """Agrega señales por dispositivo."""
        devices = df.groupBy("device_name").count().collect()
        
        return {
            "devices": {row["device_name"]: row["count"] for row in devices if row["device_name"]}
        }
    
    def calculate_statistics(self, df: DataFrame) -> Dict[str, Any]:
        """Calcula estadísticas generales."""
        stats = df.select(
            F.count("*").alias("total"),
            F.avg("battery").alias("avg_battery"),
            F.min("battery").alias("min_battery"),
            F.max("battery").alias("max_battery"),
            F.avg("signal").alias("avg_signal"),
            F.avg("altitude").alias("avg_altitude")
        ).first()
        
        return {
            "total_signals": stats["total"],
            "average_battery": round(stats["avg_battery"], 2) if stats["avg_battery"] else 0,
            "min_battery": stats["min_battery"],
            "max_battery": stats["max_battery"],
            "average_signal": round(stats["avg_signal"], 2) if stats["avg_signal"] else 0,
            "average_altitude": round(stats["avg_altitude"], 2) if stats["avg_altitude"] else 0
        }
    
    def time_series_aggregation(self, df: DataFrame, interval: str = "hour") -> List[Dict[str, Any]]:
        """Agrega datos por intervalo de tiempo."""
        if interval == "hour":
            df_time = df.withColumn("time_bucket", F.date_trunc("hour", "timestamp"))
        elif interval == "day":
            df_time = df.withColumn("time_bucket", F.date_trunc("day", "timestamp"))
        else:
            df_time = df.withColumn("time_bucket", F.date_trunc("hour", "timestamp"))
        
        result = df_time.groupBy("time_bucket") \
            .agg(
                F.count("*").alias("count"),
                F.avg("battery").alias("avg_battery")
            ) \
            .orderBy("time_bucket") \
            .collect()
        
        return [
            {
                "timestamp": row["time_bucket"].isoformat() if row["time_bucket"] else None,
                "count": row["count"],
                "avg_battery": round(row["avg_battery"], 2) if row["avg_battery"] else 0
            }
            for row in result
        ]
    
    def filter_dataframe(self, df: DataFrame, filters: Dict[str, Any]) -> DataFrame:
        """Aplica filtros al DataFrame."""
        filtered_df = df
        
        if filters.get("sim_operators"):
            filtered_df = filtered_df.filter(F.col("sim_operator").isin(filters["sim_operators"]))
        
        if filters.get("network_types"):
            filtered_df = filtered_df.filter(F.col("network_type").isin(filters["network_types"]))
        
        if filters.get("device_names"):
            filtered_df = filtered_df.filter(F.col("device_name").isin(filters["device_names"]))
        
        return filtered_df
    
    def get_geographic_points(self, df: DataFrame, limit: int = 60000) -> List[Dict[str, Any]]:
        """Obtiene puntos geográficos para visualización en mapa."""
        points = df.select(
            "latitude", "longitude", "network_type", "sim_operator", 
            "battery", "device_name", "signal"
        ).limit(limit).collect()
        
        return [
            {
                "lat": row["latitude"],
                "lng": row["longitude"],
                "network_type": row["network_type"],
                "sim_operator": row["sim_operator"],
                "battery": row["battery"],
                "device_name": row["device_name"],
                "signal": row["signal"]
            }
            for row in points
        ]
    
    def analyze_speed_by_operator(self, df: DataFrame) -> Dict[str, Any]:
        """Analiza velocidad promedio por operadora."""
        speed_stats = df.groupBy("sim_operator").agg(
            F.avg("speed").alias("avg_speed"),
            F.max("speed").alias("max_speed"),
            F.min("speed").alias("min_speed"),
            F.count("*").alias("total_measurements")
        ).collect()
        
        return {
            row["sim_operator"]: {
                "avg_speed": round(row["avg_speed"], 2) if row["avg_speed"] else 0,
                "max_speed": round(row["max_speed"], 2) if row["max_speed"] else 0,
                "min_speed": round(row["min_speed"], 2) if row["min_speed"] else 0,
                "total": row["total_measurements"]
            }
            for row in speed_stats if row["sim_operator"]
        }
    
    def analyze_signal_by_district(self, df: DataFrame) -> List[Dict[str, Any]]:
        """Analiza calidad de señal promedio por ubicación geográfica (para mapa de calor)."""
        # Agrupar por coordenadas aproximadas (redondear a 3 decimales para agrupar zonas cercanas)
        heatmap_data = df.withColumn("lat_rounded", F.round(F.col("latitude"), 3))\
                         .withColumn("lng_rounded", F.round(F.col("longitude"), 3))\
                         .groupBy("lat_rounded", "lng_rounded").agg(
                             F.avg("signal").alias("avg_signal"),
                             F.avg("speed").alias("avg_speed"),
                             F.count("*").alias("measurements"),
                             F.first("sim_operator").alias("primary_operator")
                         ).collect()
        
        return [
            {
                "lat": row["lat_rounded"],
                "lng": row["lng_rounded"],
                "signal": round(row["avg_signal"], 2) if row["avg_signal"] else 0,
                "speed": round(row["avg_speed"], 2) if row["avg_speed"] else 0,
                "count": row["measurements"],
                "operator": row["primary_operator"]
            }
            for row in heatmap_data
        ]
    
    def analyze_coverage_by_operator(self, df: DataFrame) -> Dict[str, Any]:
        """Analiza cobertura geográfica por operadora."""
        coverage = df.groupBy("sim_operator").agg(
            F.countDistinct("latitude", "longitude").alias("unique_locations"),
            F.avg("signal").alias("avg_signal_strength"),
            F.count("*").alias("total_records")
        ).collect()
        
        return {
            row["sim_operator"]: {
                "unique_locations": row["unique_locations"],
                "avg_signal": round(row["avg_signal_strength"], 2) if row["avg_signal_strength"] else 0,
                "total_records": row["total_records"]
            }
            for row in coverage if row["sim_operator"]
        }

    def analyze_by_district(self, df: DataFrame, geojson_path: str = None) -> Dict[str, Any]:
        """Analiza datos agrupados por distrito geográfico."""
        import json
        
        # Cargar GeoJSON con distritos si está disponible
        district_mapping = {}
        if geojson_path:
            try:
                with open(geojson_path, 'r', encoding='utf-8') as f:
                    geojson_data = json.load(f)
                    for feature in geojson_data.get('features', []):
                        props = feature.get('properties', {})
                        district_name = props.get('distrito') or props.get('nombreciud', 'Unknown')
                        # Simplificar para matching
                        district_mapping[district_name] = {
                            'nombre': district_name,
                            'poblacion': props.get('poblacion', 0),
                            'viviendas': props.get('viviendas', 0)
                        }
            except Exception as e:
                logger.error(f"Error loading GeoJSON: {e}")
        
        # Crear "distrito virtual" basado en coordenadas redondeadas
        # (agrupación por zonas geográficas)
        district_stats = df.withColumn("virtual_district", 
                                       F.concat(
                                           F.round(F.col("latitude"), 2).cast("string"),
                                           F.lit("_"),
                                           F.round(F.col("longitude"), 2).cast("string")
                                       ))\
                          .groupBy("virtual_district").agg(
                              F.count("*").alias("total_signals"),
                              F.avg("signal").alias("avg_signal"),
                              F.avg("speed").alias("avg_speed"),
                              F.first("latitude").alias("lat"),
                              F.first("longitude").alias("lng"),
                              # Contar por operadora
                              F.sum(F.when(F.col("sim_operator") == "ENTEL", 1).otherwise(0)).alias("count_entel"),
                              F.sum(F.when(F.col("sim_operator") == "TIGO", 1).otherwise(0)).alias("count_tigo"),
                              F.sum(F.when(F.col("sim_operator") == "VIVA", 1).otherwise(0)).alias("count_viva"),
                              # Contar por tipo de red
                              F.sum(F.when(F.col("network_type") == "WiFi", 1).otherwise(0)).alias("count_wifi"),
                              F.sum(F.when(F.col("network_type") == "4G", 1).otherwise(0)).alias("count_4g"),
                              F.sum(F.when(F.col("network_type") == "3G", 1).otherwise(0)).alias("count_3g")
                          ).collect()
        
        results = []
        for row in district_stats:
            district_data = {
                "district_id": row["virtual_district"],
                "coordinates": {"lat": row["lat"], "lng": row["lng"]},
                "total_signals": row["total_signals"],
                "avg_signal": round(row["avg_signal"], 2) if row["avg_signal"] else 0,
                "avg_speed": round(row["avg_speed"], 2) if row["avg_speed"] else 0,
                "operators": {
                    "ENTEL": row["count_entel"],
                    "TIGO": row["count_tigo"],
                    "VIVA": row["count_viva"]
                },
                "network_types": {
                    "WiFi": row["count_wifi"],
                    "4G": row["count_4g"],
                    "3G": row["count_3g"]
                }
            }
            results.append(district_data)
        
        # Ordenar por total de señales (descendente)
        results.sort(key=lambda x: x["total_signals"], reverse=True)
        
        return {
            "districts": results[:50],  # Top 50 distritos
            "total_districts": len(results)
        }

    
    def stop(self):
        """Detiene la sesión de Spark."""
        self.spark.stop()


# Singleton instance
spark_etl_service = SparkETLService()
