export default function exportToCSV(rows, columns, tabla, filtro) {

    if (!rows.length) return

    const headers = columns.map(col => col.label)

    const csvRows = rows.map(row =>
        columns.map(col => `"${row[col.key] ?? ""}"`).join(",")
    )
    // añadir información extra al final
    const csvContent = [
        `Tabla seleccionada,${tabla}`,
        `Filtro,${filtro}`,
        "",
        headers.join(","),
        ...csvRows
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const filename = `${tabla}_${new Date().toISOString().slice(0, 10)}`

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}