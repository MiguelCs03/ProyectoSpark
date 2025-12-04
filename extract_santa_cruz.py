#!/usr/bin/env python3
"""
Extract Santa Cruz provinces from BOL GeoJSON
Improved version - extracts ALL Santa Cruz provinces based on geographic bounds
"""
import json

# Read full GeoJSON
with open('frontend/public/geoBoundaries-BOL-ADM2.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Santa Cruz approximate geographic bounds
# Latitude: -20.5 to -13.5
# Longitude: -64.5 to -57.5
SANTA_CRUZ_BOUNDS = {
    'min_lat': -20.5,
    'max_lat': -13.5,
    'min_lon': -64.5,
    'max_lon': -57.5
}

def is_in_santa_cruz(feature):
    """Check if a feature is within Santa Cruz bounds"""
    geometry = feature.get('geometry', {})
    coordinates = geometry.get('coordinates', [])
    
    if not coordinates:
        return False
    
    # Get center point (rough approximation)
    def get_center(coords):
        if isinstance(coords[0], (int, float)):
            return coords
        elif isinstance(coords[0], list):
            if isinstance(coords[0][0], (int, float)):
                # List of coordinate pairs
                lats = [c[1] for c in coords if len(c) >= 2]
                lons = [c[0] for c in coords if len(c) >= 2]
                if lats and lons:
                    return [sum(lons)/len(lons), sum(lats)/len(lats)]
            else:
                # Nested structure - recursively flatten
                all_coords = []
                for subcoords in coords:
                    result = get_center(subcoords)
                    if result:
                        all_coords.append(result)
                if all_coords:
                    lats = [c[1] for c in all_coords]
                    lons = [c[0] for c in all_coords]
                    return [sum(lons)/len(lons), sum(lats)/len(lats)]
        return None
    
    center = get_center(coordinates)
    if not center or len(center) < 2:
        return False
    
    lon, lat = center[0], center[1]
    
    # Check if within bounds
    return (SANTA_CRUZ_BOUNDS['min_lat'] <= lat <= SANTA_CRUZ_BOUNDS['max_lat'] and
            SANTA_CRUZ_BOUNDS['min_lon'] <= lon <= SANTA_CRUZ_BOUNDS['max_lon'])

# Filter Santa Cruz provinces
santa_cruz_features = []
for feature in data['features']:
    if is_in_santa_cruz(feature):
        props = feature.get('properties', {})
        shape_name = props.get('shapeName', 'Unknown')
        santa_cruz_features.append(feature)
        print(f"✓ Found: {shape_name}")

# Create new GeoJSON with only Santa Cruz
output = {
    "type": "FeatureCollection",
    "crs": data.get('crs', {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}),
    "features": santa_cruz_features
}

# Save
with open('frontend/public/santa-cruz-provinces.geojson', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ Created santa-cruz-provinces.geojson with {len(santa_cruz_features)} provinces/municipalities")
