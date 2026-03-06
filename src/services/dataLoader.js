import { normalizeData } from "../utils/dataAdapter"

const API_URL = "http://localhost:5000/api"

export async function loadDataset(dataset) {

  // 1️⃣ compatibilidad con tu sistema actual (string)
  if (typeof dataset === "string") {

    const res = await fetch(`/${dataset}`)
    const text = await res.text()

    return normalizeData(text)
  }

  // 2️⃣ datos desde API
  if (dataset.type === "api") {

    console.log("fetching:", `${API_URL}/data/${dataset.table}`)
    const res = await fetch(`${API_URL}/data/${dataset.table}`)
    const data = await res.json()
    console.log("dataset seleccionado:", dataset)

    return normalizeData(data)
  }

  // 3️⃣ archivo subido por usuario
  if (dataset.type === "upload") {

    const text = await dataset.file.text()

    return normalizeData(text)
  }

  return []
}