import { useState, useMemo } from "react"

export default function useGeoTable(rows, sortConfig, search) {

  const sortedRows = useMemo(() => {

    const sorted = [...rows]

    if (!sortConfig.key) return sorted

    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    return sorted

  }, [rows, sortConfig])

  const filteredRows = useMemo(() => {

    return sortedRows.filter(row =>
      Object.values(row).some(value =>
        String(value ?? "").toLowerCase().includes(search.toLowerCase())
      )
    )

  }, [sortedRows, search])

  return { filteredRows }
}