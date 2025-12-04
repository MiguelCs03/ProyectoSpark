"""
Script de verificación de conexión a Supabase
Ejecutar antes de iniciar la aplicación principal
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("🔍 Verificando configuración de Supabase...")
print(f"URL: {SUPABASE_URL}")
print(f"Key: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY else "Key: No configurada")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("\n❌ ERROR: Credenciales de Supabase no configuradas")
    print("Por favor, configura SUPABASE_URL y SUPABASE_KEY en el archivo .env")
    exit(1)

print("\n📡 Intentando conectar a Supabase...")

try:
    from supabase import create_client
    
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Conexión a Supabase exitosa!")
    
    # Intentar hacer una consulta simple
    print("\n🔍 Verificando tabla 'locations'...")
    
    try:
        response = client.table("locations").select("*").limit(1).execute()
        print(f"✅ Tabla 'locations' encontrada! Registros de ejemplo: {len(response.data)}")
        
        if response.data:
            print(f"📊 Primer registro: {response.data[0]}")
        else:
            print("⚠️  La tabla está vacía. Considera agregar datos de prueba.")
            
    except Exception as e:
        print(f"⚠️  Error al consultar tabla 'locations': {e}")
        print("La tabla podría no existir. Revisa la documentación en docs/DATABASE.md")
    
    print("\n✅ Verificación completada!")
    print("Puedes iniciar el servidor con: python main.py")
    
except ImportError:
    print("❌ Error: El módulo 'supabase' no está instalado")
    print("Ejecuta: pip install -r requirements.txt")
    exit(1)
    
except Exception as e:
    print(f"❌ Error al conectar a Supabase: {e}")
    print("Verifica tus credenciales en el archivo .env")
    exit(1)
