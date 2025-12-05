"""
Aplicación principal FastAPI.
Punto de entrada del backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes, websocket
from app.config import config
import logging
import uvicorn

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Santa Cruz Signal Analytics API",
    description="API para análisis de señales de internet en Santa Cruz, Bolivia",
    version="1.0.0"
)

# CORS - permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(routes.router, prefix="/api", tags=["API"])
app.include_router(websocket.router, prefix="/api", tags=["WebSocket"])


@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación."""
    logger.info("🚀 Starting Santa Cruz Signal Analytics API")
    
    try:
        config.validate()
        logger.info("✓ Configuration validated")
    except ValueError as e:
        logger.error(f"✗ Configuration error: {e}")
        raise
    
    logger.info(f"✓ Supabase URL: {config.SUPABASE_URL}")
    logger.info("✓ Spark ETL initialized")
    logger.info(f"✓ Server running on {config.API_HOST}:{config.API_PORT}")


@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación."""
    logger.info("Shutting down Santa Cruz Signal Analytics API")
    from app.etl.spark_pipeline import spark_etl_service
    spark_etl_service.stop()
    logger.info("✓ Spark session stopped")


@app.get("/")
async def root():
    """Endpoint raíz."""
    return {
        "message": "Santa Cruz Signal Analytics API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    # Optimización: Usar workers para concurrencia si no estamos en modo reload
    # Nota: reload y workers son incompatibles en uvicorn
    uvicorn.run(
        "main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=True, # Mantener reload para desarrollo, pero limita a 1 worker
        log_level="info"
    )
