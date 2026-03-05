const hiddenFields = [
  "geometry",
  "geom",
  "the_geom",
  "wkb_geometry"
]

export function getColumns(rows) {

  if (!rows.length) return []

  return [...new Set(rows.flatMap(row => Object.keys(row)))]
    .filter(key => !hiddenFields.includes(key))
    .map(key => ({
      key,
      label: key
    }))
}