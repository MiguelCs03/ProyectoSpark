#!/bin/bash
# Script de instalación y setup del proyecto
# Big Data Analytics - Santa Cruz Internet Signals

echo "🚀 Instalando dependencias del proyecto Santa Cruz Analytics"
echo "================================================================"

# Backend
echo ""
echo "📦 Instalando dependencias del Backend (Python)..."
cd backend

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual de Python..."
    python3 -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
echo "Instalando paquetes de Python..."
pip install --upgrade pip
pip install -r requirements.txt

# Copiar archivo de entorno
if [ ! -f ".env" ]; then
    echo "Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  Recuerda configurar las credenciales en backend/.env"
fi

echo "✓ Backend instalado correctamente"

# Frontend
cd ../frontend
echo ""
echo "📦 Instalando dependencias del Frontend (Node.js)..."
npm install

echo ""
echo "✓ Frontend instalado correctamente"
echo ""
echo "================================================================"
echo "✅ Instalación completada!"
echo ""
echo "Para iniciar el proyecto:"
echo "  Backend:  cd backend && source venv/bin/activate && python main.py"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
