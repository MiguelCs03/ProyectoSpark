#!/bin/bash
# Script para iniciar el proyecto completo
# Inicia Backend y Frontend en paralelo

echo "🚀 Iniciando Santa Cruz Internet Analytics Dashboard"
echo "===================================================="

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo "📡 Iniciando Backend (FastAPI + Spark)..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar Frontend
echo "🌐 Iniciando Frontend (React + Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servicios iniciados!"
echo "===================================================="
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "URLs disponibles:"
echo "  🌐 Frontend:  http://localhost:5173"
echo "  📡 Backend:   http://localhost:8000"
echo "  📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"
echo "===================================================="

# Esperar a que se detengan los procesos
wait
