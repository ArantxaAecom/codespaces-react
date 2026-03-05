import { useEffect, useState } from "react"
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TableSortLabel from '@mui/material/TableSortLabel'
import exportToCSV from "../utils/export2CSV"
import { normalizeData } from "../utils/dataAdapter"

export default function GeoTable() {

  // Para la edición de la tabla, si es admin
  const isAdmin = true
  const [dataset, setDataset] = useState("test.json")
  const [rows, setRows] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  })
  const [search, setSearch] = useState("")
  const [newColumn, setNewColumn] = useState("")
  // mensaje de guardado con éxito y pedir exportar
  const [message, setMessage] = useState("")
  const isCSV = dataset.endsWith(".csv")
  // Evitar que el mensaje se quede permanente
  useEffect(() => {

    if (!message) return

    const timer = setTimeout(() => {
      setMessage("")
    }, 3000)

    return () => clearTimeout(timer)

  }, [message])

  const handleSort = (columnKey) => {
    let direction = "asc"

    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({
      key: columnKey,
      direction
    })
  }

  const sortedRows = [...rows]
  if (sortConfig.key) {
    sortedRows.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }

  // para filtrar las celdas dependiendo del buscador
  const filteredRows = sortedRows.filter(row =>
    Object.values(row).some(value =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  )

  // Para escribir en mayúsculas la primera las cabeceras de las tablas
  const toTitleCase = (str) =>
    str
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())

  useEffect(() => {
    fetch(`/${dataset}`)
      .then(res => res.text())
      .then(data => {
        const tableRows = normalizeData(data)
        setRows(tableRows)
      })
  }, [dataset])

  const columns = rows.length
    ? [...new Set(rows.flatMap(row => Object.keys(row)))].map(key => ({
      key,
      label: key
    }))
    : []

  // Evitar que se puedan modificar los campos "id"
  const lockedFields = ["id", "gid", "objectid"]
  function handleCellChange(rowId, columnKey, value) {
    const updatedRows = rows.map(row =>
      row.gid === rowId
        ? { ...row, [columnKey]: value }
        : row
    )

    setRows(updatedRows)
  }
  // Llamada al backend para persistir los cambios hechos en la tabla
  async function saveChanges() {

    const API_URL = window.location.origin.replace("3000", "5000")

    try {

      const res = await fetch(`${API_URL}/api/update-table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dataset,
          rows
        })
      })

      if (res.ok) {
        setMessage("Cambios guardados correctamente")
      }

    } catch (error) {
      setMessage("Error al guardar los cambios")
    }

  }

  // Para añadir columnas a la tabla
  function addColumn(columnName) {

    const safeName = columnName.trim().toLowerCase().replace(/\s+/g, "_")
    if (!safeName) return
    if (rows.length && safeName in rows[0]) {
      alert("La columna ya existe")
      return
    }
    const updatedRows = rows.map(row => ({
      ...row,
      [safeName]: ""
    }))

    setRows(updatedRows)
  }

  return (
    <div>

      <select
        value={dataset}
        onChange={(e) => setDataset(e.target.value)}
      >
        <option value="test.json">Barrios</option>
        <option value="streets.json">Calles</option>
        <option value="stations.json">Estaciones</option>
        <option value="streets_2026-03-05.csv">Calles CSV export</option>
      </select>

      {isCSV && (
        <div style={{ background: "#fff3cd", padding: "8px", marginBottom: "10px" }}>
          Este dataset proviene de un CSV. Para guardar cambios exporta el archivo actualizado.
        </div>
      )}
      {message && (
        <div style={{ background: "#d4edda", padding: "8px", marginTop: "10px" }}>
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <input
        type="text"
        placeholder="Nuevo campo..."
        value={newColumn}
        onChange={(e) => setNewColumn(e.target.value)}
      />

      <button onClick={() => addColumn(newColumn)}>
        Añadir campo
      </button>

      <TableContainer component={Paper}>
        <Table size="small">

          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.key}>
                  <TableSortLabel
                    active={sortConfig.key === col.key}
                    direction={sortConfig.key === col.key ? sortConfig.direction : "asc"}
                    onClick={() => handleSort(col.key)}
                  >
                    {toTitleCase(col.label)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row, i) => (
              <TableRow key={i}>
                {columns.map(col => (
                  <TableCell key={col.key}>
                    {isAdmin && !lockedFields.includes(col.key) ? (
                      <input
                        value={row[col.key]}
                        onChange={(e) =>
                          handleCellChange(row.gid, col.key, e.target.value)
                        }
                      />
                    ) : (
                      row[col.key]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
      {isAdmin && (
        <button onClick={saveChanges}>
          Guardar cambios
        </button>
      )}

      <button onClick={() => exportToCSV(filteredRows, columns, dataset, search)}>
        Exportar CSV
      </button>

    </div>
  )
}