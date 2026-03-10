import { Row } from "../types"

/**
 * Convierte un texto en formato CSV a un array de objetos Row.
 * Asigna un ID basado en el índice de la línea si no existe uno.
 * 
 * @param text - Contenido del CSV en crudo
 * @returns Array de objetos que cumplen con la interfaz Row
 */
function parseCSV(text: string): Row[] {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map(h => h.trim())

  return lines.slice(1).map((line, i) => {
    const values = line.split(",")
    // Inicializamos la fila con un ID basado en el índice para asegurar la interfaz Row
    const row: Row = { id: i }

    headers.forEach((header, index) => {
      row[header] = values[index]
        ?.replace(/"/g, "")
        .replace(/\r/g, "")
        .trim()
    })

    return row
  })
}

/**
 * Normaliza diferentes formatos de entrada (JSON, GeoJSON, CSV) a un formato estándar de tabla.
 * Implementa una estrategia de cascada para encontrar o generar IDs únicos.
 * 
 * @param data - Los datos de entrada (string JSON/CSV o objeto ya parseado)
 * @returns Array de objetos Row listos para el componente de tabla
 */
export function normalizeData(data: any): Row[] {
  // Evitar procesar errores comunes de servidores que devuelven HTML
  if (typeof data === "string" && data.startsWith("<!DOCTYPE")) {
    console.error("Se ha recibido HTML en vez de datos")
    return []
  }

  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data

    // 1. Manejo de APIs típicas (formatos .data o .rows)
    if (parsed.data) return parsed.data
    if (parsed.rows) return parsed.rows

    // 2. Formato de registros complejos (con cascada de IDs)
    if (parsed.records && Array.isArray(parsed.records)) {
      return (parsed.records as any[]).map((r: any, i: number): Row => {
        const { properties, ...rest } = r
        // Cascada de ID: id > gid > objectid > índice
        const rowId = r.id ?? r.gid ?? r.objectid ?? i

        return {
          ...rest,
          ...(properties || {}),
          id: rowId
        }
      })
    }

    // 3. Formato GeoJSON (Especialmente crítico para IDs GIS)
    if (parsed.type === "FeatureCollection" && Array.isArray(parsed.features)) {
      return (parsed.features as any[]).map((f: any, i: number): Row => {
        // Cascada de ID GeoJSON: f.id > properties.gid > properties.id > índice
        const rowId = f.id ?? f.properties?.gid ?? f.properties?.id ?? i

        return {
          id: rowId,
          ...f.properties
        }
      })
    }

    // 4. Array de objetos directo (JSON estándar)
    if (Array.isArray(parsed)) {
      return parsed as Row[]
    }

  } catch (error) {
    // Si falla el parseo JSON, intentamos tratarlo como CSV
    if (typeof data === "string") {
      return parseCSV(data)
    }
  }

  return []
}
