# 🚀 Guía de Deployment

## Requisitos del Sistema

### Mínimos
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 10 GB
- **SO**: Linux, macOS, o Windows con WSL2

### Recomendados (Producción)
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Disco**: 50+ GB SSD
- **SO**: Ubuntu 20.04+ o similar

### Software
- Python 3.8+
- Node.js 16+
- Java 8+ (para Spark)

---

## Instalación Local

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd spark
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install
```

### 4. Iniciar Servicios

**Opción A: Script automático**
```bash
# Desde la raíz del proyecto
./install.sh  # Una sola vez
./start.sh    # Para iniciar
```

**Opción B: Manual**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Deployment en Producción

### Backend (FastAPI + Spark)

#### Docker
```dockerfile
# Dockerfile
FROM python:3.10-slim

# Instalar Java para Spark
RUN apt-get update && apt-get install -y openjdk-11-jre-headless

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build y run
docker build -t santa-cruz-backend .
docker run -p 8000:8000 --env-file .env santa-cruz-backend
```

#### Systemd Service
```ini
# /etc/systemd/system/santa-cruz-api.service
[Unit]
Description=Santa Cruz Signal Analytics API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/santa-cruz-analytics/backend
Environment="PATH=/opt/santa-cruz-analytics/backend/venv/bin"
ExecStart=/opt/santa-cruz-analytics/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable santa-cruz-api
sudo systemctl start santa-cruz-api
```

#### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/santa-cruz-analytics
server {
    listen 80;
    server_name api.santacruz-analytics.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

### Frontend (React + Vite)

#### Build Production
```bash
cd frontend
npm run build
```

#### Nginx Static Hosting
```nginx
# /etc/nginx/sites-available/santa-cruz-frontend
server {
    listen 80;
    server_name santacruz-analytics.com;
    root /var/www/santa-cruz-analytics/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Netlify / Vercel
```bash
# Netlify
npm run build
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

---

## Variables de Entorno

### Backend (.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend
```bash
# Si necesitas configurar la URL del backend en producción
VITE_API_URL=https://api.santacruz-analytics.com
```

Actualizar `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

---

## Monitoreo

### PM2 para Backend
```bash
npm install -g pm2
pm2 start "python main.py" --name santa-cruz-api
pm2 startup
pm2 save
```

### Logs
```bash
# Backend
pm2 logs santa-cruz-api

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Optimización de Producción

### Backend
1. **Múltiples workers**:
   ```bash
   uvicorn main:app --workers 4 --host 0.0.0.0 --port 8000
   ```

2. **Configurar Spark**:
   ```python
   .config("spark.driver.memory", "4g")
   .config("spark.executor.memory", "4g")
   ```

3. **Habilitar compression**:
   ```python
   app.add_middleware(GZipMiddleware, minimum_size=1000)
   ```

### Frontend
1. **Code splitting**: Ya incluido con Vite
2. **Lazy loading**: Componentes dinámicos
3. **CDN**: Servir assets desde CDN

---

## Seguridad

### HTTPS con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d santacruz-analytics.com
```

### CORS en Producción
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://santacruz-analytics.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Troubleshooting

### Puerto en uso
```bash
# Encontrar proceso usando puerto 8000
lsof -i :8000
kill -9 <PID>
```

### Spark Java error
```bash
# Verificar Java
java -version
# Si no está instalado
sudo apt install openjdk-11-jre-headless
```

### WebSocket no conecta
- Verificar firewall
- Revisar configuración de proxy (Nginx)
- Verificar CORS settings
