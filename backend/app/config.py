"""
Configuración centralizada de la aplicación.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración de la aplicación - KISS: simple y directo."""
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Spark
    SPARK_APP_NAME: str = "SantaCruzSignalETL"
    SPARK_MASTER: str = "local[*]"
    
    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30
    
    @classmethod
    def validate(cls):
        """Valida que las configuraciones críticas estén presentes."""
        if not cls.SUPABASE_URL or not cls.SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")


config = Config()
