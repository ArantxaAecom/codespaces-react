import { Row, TableColumn } from "../types"

const hiddenFields: string[] = [
  "geometry",
  "geom",
  "the_geom",
  "wkb_geometry"
]

/**
 * Obtiene la lista de columnas únicas a partir de un array de filas.
 * Filtra los campos técnicos o geométricos no deseados.
 * 
 * @param rows - Array de objetos de datos (filas)
 * @returns Array de objetos que definen la columna (key y label)
 */
export function getColumns(rows: Row[]): TableColumn[] {

  if (!rows || rows.length === 0) return []

  // Extraer todas las claves únicas de todas las filas
  const allKeys: string[] = Array.from(new Set(rows.flatMap(row => Object.keys(row))))

  return allKeys
    .filter(key => !hiddenFields.includes(key))
    .map(key => ({
      key,
      label: key
    }))
}
