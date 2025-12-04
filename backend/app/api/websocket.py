"""
WebSocket para datos en tiempo real.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json
import logging
from app.services.supabase_service import supabase_service
from app.etl.spark_pipeline import spark_etl_service

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    """Maneja conexiones WebSocket - KISS: gestión simple de clientes."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """Envía mensaje a todos los clientes conectados."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                disconnected.append(connection)
        
        # Limpiar conexiones muertas
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = ConnectionManager()


@router.websocket("/ws/signals")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint para streaming de datos en tiempo real.
    """
    await manager.connect(websocket)
    
    try:
        # Enviar datos iniciales
        initial_data = supabase_service.get_all_signals(limit=100)
        await websocket.send_json({
            "type": "initial",
            "data": initial_data
        })
        
        # Loop para enviar actualizaciones periódicas
        while True:
            try:
                # Esperar mensaje del cliente o timeout
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                
                # Procesar peticiones del cliente
                request = json.loads(data)
                
                if request.get("action") == "refresh":
                    # Enviar datos actualizados
                    filters = request.get("filters", {})
                    fresh_data = supabase_service.get_signals_with_filters(filters) if filters else supabase_service.get_all_signals()
                    
                    await websocket.send_json({
                        "type": "update",
                        "data": fresh_data,
                        "timestamp": asyncio.get_event_loop().time()
                    })
                
            except asyncio.TimeoutError:
                # Heartbeat - enviar ping
                await websocket.send_json({
                    "type": "ping",
                    "timestamp": asyncio.get_event_loop().time()
                })
            
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected normally")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


async def broadcast_new_signal(signal_data: dict):
    """
    Función helper para broadcast de nuevas señales.
    Llamar cuando lleguen nuevos datos de Supabase.
    """
    await manager.broadcast({
        "type": "new_signal",
        "data": signal_data
    })
