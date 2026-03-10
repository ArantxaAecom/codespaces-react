import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TableSortLabel from '@mui/material/TableSortLabel'
import exportToCSV from "../utils/export2CSV"
import { getColumns } from "../utils/tableColumns"
import FileLoader from "./FileLoader"
import useTableLogic from "../hooks/useTableLogic"
import { GeoTableProps } from "../types"

/**
* Componente de tabla geográfica con funcionalidades de edición,
* ordenación y filtrado.
*
* @param props - Propiedades del componente definidas en GeoTableProps
* @returns Elemento JSX de la tabla con controles de administración
*/
export default function GeoTable({ onRowSelect, selectedFeature }: GeoTableProps): JSX.Element {
    const isAdmin: boolean = true
    const lockedFields: string[] = ["id", "gid", "objectid"]

    const {
        rows,
        search,
        setSearch,
        dataset,
        setDataset,
        message,
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
    } = useTableLogic(onRowSelect)

    const columns = getColumns(rows)

    /**
    * Convierte un string de snake_case a Title Case para las cabeceras.
    * @param str - Texto original (ej. "nombre_via")
    * @returns Texto formateado (ej. "Nombre Via")
    */
    const toTitleCase = (str: string) :string =>
        str
            .replace(/_/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase())

    return (
        <div>
            <FileLoader onFileLoad={setDataset} />

            <select value={(dataset && typeof dataset === 'object' && 'table' in dataset) ? dataset.table : ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDataset({ type: "api", table: e.target.value })
                }>
                <option value="">Selecciona tabla</option>
                {tables.map(t => (
                    <option key={t.name} value={t.name}>
                        {t.name}
                    </option>
                ))}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />

            <input
                type="text"
                placeholder="Nuevo campo..."
                value={newColumn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColumn(e.target.value)}
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
                            <TableRow key={row.id}
                                onClick={() => onRowSelect(row)}
                                selected={selectedFeature?.id === row.id}
                            >
                                {columns.map(col => (
                                    <TableCell key={col.key}>
                                        {isAdmin && !lockedFields.includes(col.key) ? (
                                            <input
                                                value={row[col.key] ?? ""}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleCellChange(row.id, col.key, e.target.value)
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