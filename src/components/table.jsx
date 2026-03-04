import { useEffect, useState } from "react"
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import exportToCSV from "../utils/export2CSV"

export default function GeoTable() {

  const [dataset, setDataset] = useState("barrios")
  const [rows, setRows] = useState([])
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  })
  const [search, setSearch] = useState("")

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
    fetch(`/${dataset}.json`)
      .then(res => res.json())
      .then(data => {

        const tableRows = data.features
          .filter(f => f.properties && Object.keys(f.properties).length > 0)
          .map(f => {
            const cleanedProps = {}

            Object.entries(f.properties).forEach(([key, value]) => {
              cleanedProps[key] =
                value === null || value === undefined || value === ""
                  ? "sin nombre"
                  : value
            })

            return cleanedProps
          })

        setRows(tableRows)

      })
  }, [dataset])

  const columns = rows.length
    ? [...new Set(rows.flatMap(row => Object.keys(row)))].map(key => ({
      key,
      label: key
    }))
    : []

  return (
    <div>

      <select
        value={dataset}
        onChange={(e) => setDataset(e.target.value)}
      >
        <option value="test">Barrios</option>
        <option value="streets">Calles</option>
        <option value="stations">Estaciones</option>
      </select>

      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table size="small">

          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ cursor: "pointer" }}
                >
                  {toTitleCase(col.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row, i) => (
              <TableRow key={i}>
                {columns.map(col => (
                  <TableCell key={col.key}>
                    {row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      <button onClick={() => exportToCSV(filteredRows, columns, dataset, search)}>
        Exportar CSV
      </button>

    </div>
  )
}