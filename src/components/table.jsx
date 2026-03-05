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
import { loadDataset } from "../services/dataLoader"
import { getColumns } from "../utils/tableColumns"
import useGeoTable from "../hooks/useGeoTable"
import useAutoMessage from "../hooks/useAutoMessage"

export default function GeoTable({ onRowSelect, selectedFeature }) {

  // Para manejar la edición de la tabla, si es admin
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

  useAutoMessage(message, setMessage)

  useEffect(() => {
    loadDataset(dataset).then(setRows)
  }, [dataset])

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
  function handleCellChange(rowId, columnKey, value) {

    const updatedRows = rows.map(row =>
      row.gid === rowId
        ? { ...row, [columnKey]: value }
        : row
    )

    setRows(updatedRows)
  }
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

    } catch {
      setMessage("Error al guardar los cambios")
    }
  }
  const toTitleCase = (str) =>
    str
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())

  const { filteredRows } = useGeoTable(rows, sortConfig, search)

  const columns = getColumns(rows)
  const lockedFields = ["id", "gid", "objectid"]

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

      <TableContainer component={Paper}
        sx={{
          maxHeight: 500,
          overflow: "auto"
        }}>
        <Table size="small" stickyHeader>

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
            {filteredRows.map((row) => (
              <TableRow key={row.gid}
                onClick={() => onRowSelect(row)}
                selected={selectedFeature?.gid === row.gid}
              >
                {columns.map(col => (
                  <TableCell key={col.key}>
                    {isAdmin && !lockedFields.includes(col.key) ? (
                      <input
                        value={row[col.key]}
                        onClick={(e) => e.stopPropagation()}
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
      {isAdmin && !isCSV && (
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