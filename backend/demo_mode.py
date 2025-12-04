"""
Script de prueba con datos MOCK - No requiere Supabase
Ejecutar para probar el sistema sin conexión a BD
"""
print("🔍 Modo DEMO - Usando datos de prueba")
print("=" * 60)

# Datos de prueba simulados
mock_data = [
    {
        "id": 1,
        "latitud": -17.783300,
        "longitud": -63.182140,
        "altura": 415.5,
        "tipo_senal": "4G",
        "empresa": "Entel",
        "nivel_bateria": 85,
        "porcentaje_bateria": 85.3,
        "provincia": "Andrés Ibáñez",
        "distrito": "Distrito 1",
        "zona": "Zona Norte",
        "municipio": "Santa Cruz de la Sierra"
    },
    {
        "id": 2,
        "latitud": -17.814600,
        "longitud": -63.156100,
        "altura": 420.0,
        "tipo_senal": "5G",
        "empresa": "Tigo",
        "nivel_bateria": 92,
        "porcentaje_bateria": 92.1,
        "provincia": "Andrés Ibáñez",
        "distrito": "Distrito 2",
        "zona": "Zona Centro",
        "municipio": "Santa Cruz de la Sierra"
    },
    {
        "id": 3,
        "latitud": -17.800000,
        "longitud": -63.170000,
        "altura": 410.0,
        "tipo_senal": "4G",
        "empresa": "Viva",
        "nivel_bateria": 67,
        "porcentaje_bateria": 67.5,
        "provincia": "Andrés Ibáñez",
        "distrito": "Distrito 3",
        "zona": "Zona Sur",
        "municipio": "Santa Cruz de la Sierra"
    }
]

print(f"✅ Datos de prueba cargados: {len(mock_data)} señales")
print(f"✅ Provincias: Andrés Ibáñez")
print(f"✅ Empresas: Entel, Tigo, Viva")
print(f"✅ Tipos de señal: 4G, 5G")
print("=" * 60)
print("\n💡 NOTA: Este es un modo DEMO con datos simulados")
print("Para usar datos reales, necesitas configurar la clave ANON de Supabase")
print("\nPasos para obtener la clave correcta:")
print("1. Ve a: https://supabase.com/dashboard/project/lmqpbtuljodwklxdixjq/settings/api")
print("2. Copia la clave 'anon public' (la que empieza con 'eyJ...')")
print("3. Actualiza backend/.env con: SUPABASE_KEY=<tu-clave-anon>")
print("\n✅ El proyecto está listo para funcionar con datos reales cuando tengas la clave!")
