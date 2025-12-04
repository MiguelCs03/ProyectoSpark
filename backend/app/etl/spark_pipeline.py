"""
ETL Pipeline usando Apache Spark.
Procesa datos de señales para análisis y agregaciones.
"""
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, TimestampType
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class SparkETLService:
    """Servicio ETL con Spark - YAGNI: solo transformaciones necesarias."""
    
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("SantaCruzSignalETL") \
            .master("local[*]") \
            .config("spark.driver.memory", "2g") \
            .getOrCreate()
        
        self.spark.sparkContext.setLogLevel("WARN")
    
    def create_dataframe(self, data: List[Dict[str, Any]]) -> DataFrame:
        """Crea DataFrame de Spark desde datos de Supabase."""
        if not data:
            return self.spark.createDataFrame([], self._get_schema())
        
        # Convertir a JSON y luego cargar - Spark maneja mejor los tipos así
        import json
        json_data = [json.dumps(row) for row in data]
        json_rdd = self.spark.sparkContext.parallelize(json_data)
        return self.spark.read.json(json_rdd)
    
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
    
    def stop(self):
        """Detiene la sesión de Spark."""
        self.spark.stop()


# Singleton instance
spark_etl_service = SparkETLService()
