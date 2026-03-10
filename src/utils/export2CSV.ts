import { Row, TableColumn, Dataset } from "../types"

/**
 * 
 * @param rows - Filas visiables en la tabla
 * @param columns - Columnas seleccionadas a exportar
 * @param tabla Dataset actual para inferir el nombre del archivo
 * @param filtro Filtro aplicado (opcional)
 * @returns 
 */
export default function exportToCSV(rows: Row[], columns: TableColumn[], tabla: Dataset, filtro: string = ""): void {

    if (!rows.length) return

    const headers = columns.map(col => col.label)

    const csvRows = rows.map(row =>{
        return columns.map(col => {
            const value = row[col.key] ?? "";
            return `"${String(value).replace(/"/g, '""') ?? ""}"`
            }).join(",")
        }
    )
    const tableName: string = typeof tabla === "string"
        ? tabla
        : (tabla?.table || "desconocida");
    // añadir información extra al final
    const csvContent = [
        `Tabla seleccionada,${tableName}`,
        `Filtro,${filtro}`,
        "",
        headers.join(","),
        ...csvRows
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    let filename = "export";
    if (typeof tabla === "string") {
        filename = tabla.split(".")[0] + "_export"
    } else if (tabla && typeof tabla === 'object' && 'table' in tabla ) {
        filename = `${tabla.table}_export`;
    }
    

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}