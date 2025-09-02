import requests
import csv

# Consulta Overpass: incluye amenity, shop, leisure, tourism, office
overpass_url = "https://overpass-api.de/api/interpreter"
query = """
[out:json][timeout:1800];
area["name"="Mar del Plata"]->.searchArea;
(
  node["amenity"](area.searchArea);
  way["amenity"](area.searchArea);
  relation["amenity"](area.searchArea);

  node["shop"](area.searchArea);
  way["shop"](area.searchArea);
  relation["shop"](area.searchArea);

  node["leisure"](area.searchArea);
  way["leisure"](area.searchArea);
  relation["leisure"](area.searchArea);

  node["tourism"](area.searchArea);
  way["tourism"](area.searchArea);
  relation["tourism"](area.searchArea);

  node["office"](area.searchArea);
  way["office"](area.searchArea);
  relation["office"](area.searchArea);
);
out center;
"""

# Hacer la consulta
response = requests.get(overpass_url, params={'data': query})
data = response.json()

# Crear CSV en una ruta absoluta (Ej: escritorio en Windows)
output_file = output_file = "./establecimientos_mar_del_plata.csv"

with open(output_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["nombre", "ubicacion", "latitud", "longitud", "TipoDeEstablecimiento"])
    
    for element in data["elements"]:
        tags = element.get("tags", {})
        
        nombre = tags.get("name", "Sin nombre")
        direccion = tags.get("addr:street", "Sin Dirección")
        tipo = (
            tags.get("amenity") or
            tags.get("shop") or
            tags.get("leisure") or
            tags.get("tourism") or
            tags.get("office") or
            "Desconocido"
        )
        
        # Coordenadas: node o centroide (para way/relation)
        if "lat" in element and "lon" in element:
            lat, lon = element["lat"], element["lon"]
        else:
            lat, lon = element.get("center", {}).get("lat", ""), element.get("center", {}).get("lon", "")
        
        writer.writerow([nombre, direccion, lat, lon, tipo])

print(f"✅ Archivo creado en: {output_file}")