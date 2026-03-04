import { useEffect, useState } from "react"
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

export default function GeoTable() {

  const [rows, setRows] = useState([])

  const columns = rows.length
    ? Object.keys(rows[0]).map(key => ({
      key,
      label: key
    }))
    : []

  useEffect(() => {
    fetch("/test.json")
      .then(res => res.json())
      .then(data => {
        const tableRows = data.features.map(f => ({
          ...f.properties
        }))
        setRows(tableRows)
      })
  }, [])

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  })
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


  return (
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
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {sortedRows.map((row, i) => (
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
  )
}