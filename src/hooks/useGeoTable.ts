import { useMemo } from "react"
import { Row, SortConfig } from "../types";

/**
 * Hook personaliado para manejar la lógica de ordenación y filtrado
 * @param rows - Array de filas a procesar
 * @param sortConfig - Configuración de orientación actual
 * @param search - Término de búsqueda
 * @returns - Objeto con las filas ya filtradas y ordenadas
 */

export default function useGeoTable(rows: Row[], sortConfig: SortConfig, search: String) {

    const sortedRows = useMemo(() => {

        const sorted = [...rows]

        // Si no hay clave de ordenación, devolvemos las filas tal cual
        if (!sortConfig.key) return sorted

        const { key, direction } = sortConfig

        sorted.sort((a, b) => {
            // Usamos el operador "!" para decirle a TS: "tranquilo, sé que aquí key NO es null"
            const aValue = a[key!]
            const bValue = b[key!]

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