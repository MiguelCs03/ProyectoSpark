# 🔧 Instalación en Fedora

## El problema que enfrentamos

Estás en **Fedora Linux** (no Ubuntu), por lo que los comandos de instalación son diferentes.

---

## ✅ Solución Completa para Fedora

### 1️⃣ Instalar Compiladores C (Necesario para pydantic-core)

```bash
# Comando para FEDORA (no Ubuntu)
sudo dnf install -y gcc gcc-c++ python3-devel

# Esto instalará:
# - gcc: Compilador C
# - gcc-c++: Compilador C++
# - python3-devel: Headers de Python para compilar extensiones
```

**Nota**: Te pedirá tu contraseña de sudo. Introdúcela (no se verá mientras escribes).

---

### 2️⃣ Instalar Java (Necesario para Apache Spark)

```bash
# Verificar si Java está instalado
java -version

# Si no está instalado, ejecutar:
sudo dnf install -y java-11-openjdk-headless

# Verificar instalación
java -version
```

---

### 3️⃣ Instalar Dependencias del Backend

```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/backend
source venv/bin/activate
pip install --no-cache-dir -r requirements.txt
```

Esto ahora debería funcionar porque ya tienes los compiladores instalados.

---

### 4️⃣ Verificar Conexión a Supabase

```bash
# Asegúrate de estar en el entorno virtual
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/backend
source venv/bin/activate

# Ejecutar script de prueba
python test_connection.py
```

Deberías ver:
```
✅ Conexión a Supabase exitosa!
```

---

### 5️⃣ Iniciar el Proyecto

**Opción A: Automático (Recomendado)**
```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark
./start.sh
```

**Opción B: Manual (2 terminales)**

Terminal 1 - Backend:
```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/backend
source venv/bin/activate
python main.py
```

Terminal 2 - Frontend:
```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/frontend
npm run dev
```

---

## 🌐 URLs de Acceso

Una vez iniciado:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API (Swagger)**: http://localhost:8000/docs

---

## 🐛 Solución de Problemas en Fedora

### Problema: "command not found: apt-get"
**Causa**: Estás en Fedora, no Ubuntu  
**Solución**: Usa `dnf` en lugar de `apt-get`

```bash
# Ubuntu/Debian
sudo apt-get install <paquete>

# Fedora/RHEL
sudo dnf install <paquete>
```

### Problema: "gcc: command not found"
**Solución**:
```bash
sudo dnf install gcc gcc-c++ python3-devel
```

### Problema: "java: command not found"
**Solución**:
```bash
sudo dnf install java-11-openjdk-headless
```

### Problema: Puerto en uso
```bash
# Encontrar proceso
lsof -i :8000

# Matar proceso
kill -9 <PID>
```

### Problema: Instalación de pip falla
```bash
# Limpiar caché
pip cache purge

# Reinstalar
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install --no-cache-dir -r requirements.txt
```

---

## 📋 Checklist Rápido

- [ ] Instalar compiladores: `sudo dnf install -y gcc gcc-c++ python3-devel`
- [ ] Instalar Java: `sudo dnf install -y java-11-openjdk-headless`
- [ ] Instalar dependencias backend: `cd backend && source venv/bin/activate && pip install -r requirements.txt`
- [ ] Verificar Supabase: `python test_connection.py`
- [ ] Iniciar proyecto: `./start.sh` o manual
- [ ] Abrir navegador: http://localhost:5173

---

## 💡 Comandos Útiles en Fedora

```bash
# Actualizar sistema
sudo dnf update

# Buscar paquete
sudo dnf search <nombre>

# Info de paquete
sudo dnf info <nombre>

# Instalar paquete
sudo dnf install <nombre>

# Eliminar paquete
sudo dnf remove <nombre>

# Limpiar caché
sudo dnf clean all
```

---

## 🎯 Resumen para Ti

1. **Ejecuta esto** (te pedirá contraseña):
```bash
sudo dnf install -y gcc gcc-c++ python3-devel java-11-openjdk-headless
```

2. **Luego esto**:
```bash
cd /home/miguelangelcesarysorioco/Escritorio/Soporte/spark/backend
source venv/bin/activate
pip install --no-cache-dir -r requirements.txt
```

3. **Verificar**:
```bash
python test_connection.py
```

4. **Iniciar**:
```bash
cd ..
./start.sh
```

5. **Abrir navegador**: http://localhost:5173

¡Listo! 🚀
