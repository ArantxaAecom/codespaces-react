export function normalizeData(data) {

  // GeoJSON
  if (data.type === "FeatureCollection" && data.features) {
    return data.features.map(f => ({
      ...f.properties
    }))
  }

  // CSV parseado (array de objetos)
  if (Array.isArray(data) && typeof data[0] === "object") {
    return data
  }

  // respuesta típica de API SQL
  if (data.rows && Array.isArray(data.rows)) {
    return data.rows
  }

  throw new Error("Formato de datos no reconocido")
}