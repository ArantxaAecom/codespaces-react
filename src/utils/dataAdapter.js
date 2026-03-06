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

  if (typeof data === "string" && data.startsWith("<!DOCTYPE")) {
    console.error("Se ha recibido HTML en vez de datos")
    return []
  }

  try {

    const parsed = typeof data === "string"
    ? JSON.parse(data)
    : data

    // APIs típicas
    if (parsed.data) return parsed.data
    if (parsed.rows) return parsed.rows
    if (parsed.records) {
      if (parsed.records) {
        return parsed.records.map((r, i) => {

          const { properties, ...rest } = r

          return {
            id: r.id ?? r.gid ?? i,
            ...rest,
            ...(properties || {})
          }
        })
      }
      return parsed.records
    }

    // GeoJSON
    if (parsed.type === "FeatureCollection") {
      return parsed.features.map(f => ({
        ...f.properties
      }))
    }

    // JSON normal
    if (Array.isArray(parsed)) {
      return parsed
    }

  } catch {
    if (typeof data === "string") {
      return parseCSV(data)
    }
  }

  return []
}