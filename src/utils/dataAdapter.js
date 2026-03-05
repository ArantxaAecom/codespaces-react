function parseCSV(text) {

  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map(h => h.trim())

  return lines.slice(1).map(line => {

    const values = line.split(",")

    const row = {}

    headers.forEach((header, i) => {
      row[header] = values[i]
        ?.replace(/"/g, "")
        .replace(/\r/g, "")
        .trim()
    })

    return row
  })
}

export function normalizeData(data) {

  if (data.startsWith("<!DOCTYPE")) {
    console.error("Se ha recibido HTML en vez de datos")
    return []
  }

  try {

    const parsed = JSON.parse(data)

    // GeoJSON
    if (parsed.type === "FeatureCollection") {
      return parsed.features.map(f => ({
        ...f.properties,
        geometry: f.geometry
      }))
    }

    // JSON normal
    if (Array.isArray(parsed)) {
      return parsed
    }

  } catch {
    return parseCSV(data)
  }

  return []
}