import { useState, useEffect } from "react"
import { loadDataset } from "../services/dataLoader"
import useGeoTable from "./useGeoTable"
import useAutoMessage from "./useAutoMessage"
import { Row, Dataset, TableInfo, SortConfig } from "../types"

export default function useTableLogic(onRowSelect?: (row: Row | null) => void) {
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState<string>("")
  const [dataset, setDataset] = useState<Dataset>(null)
  const [message, setMessage] = useState<string>("")
  const [tables, setTables] = useState<TableInfo[]>([])
  const [newColumn, setNewColumn] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc"
  })

  const API_URL = "http://localhost:5000/api"

  // Cargar lista de tablas disponibles
  useEffect(() => {
    fetch(`${API_URL}/tables`)
      .then(res => res.json())
      .then((data: { tables: TableInfo[] }) => {
        setTables(data.tables || [])
      })
      .catch(err => console.error("Error fetching tables:", err))
  }, [])

  // Cargar el dataset seleccionado
  useEffect(() => {
    if (!dataset) return
    loadDataset(dataset).then((data: Row[]) => {
      setRows(data)
      onRowSelect?.(null)
    })
  }, [dataset, onRowSelect])

  // Manejo automático de mensajes temporales
  useAutoMessage(message, setMessage)

  const handleSort = (columnKey: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key: columnKey, direction })
  }

  const handleCellChange = (rowId: string | number, columnKey: string, value: any) => {
    const updatedRows = rows.map(row =>
      row.id === rowId ? { ...row, [columnKey]: value } : row
    )
    setRows(updatedRows)
  }

  const addColumn = (columnName: string) => {
    const safeName = columnName.trim().toLowerCase().replace(/\s+/g, "_")
    if (!safeName) return
    if (rows.length && safeName in rows[0]) {
      alert("La columna ya existe")
      return
    }
    const updatedRows = rows.map(row => ({ ...row, [safeName]: "" }))
    setRows(updatedRows)
    setNewColumn("") // Limpiar el input tras añadir
  }

  const saveChanges = async () => {
    const UPDATE_URL = window.location.origin.replace("3000", "5000") + "/api/update-table"
    try {
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, rows })
      })
      if (res.ok) {
        setMessage("Cambios guardados correctamente")
      }
    } catch {
      setMessage("Error al guardar los cambios")
    }
  }

  // Lógica de filtrado y ordenación externa
  // Nota: useGeoTable aún es .js, pero TS lo aceptará por el allowJs: true
  const { filteredRows } = useGeoTable(rows, sortConfig, search)

  const isCSV = typeof dataset === "string" && dataset.endsWith(".csv")

  return {
    rows,
    setRows,
    search,
    setSearch,
    dataset,
    setDataset,
    message,
    setMessage,
    tables,
    newColumn,
    setNewColumn,
    sortConfig,
    handleSort,
    handleCellChange,
    addColumn,
    saveChanges,
    filteredRows,
    isCSV
  }
}
