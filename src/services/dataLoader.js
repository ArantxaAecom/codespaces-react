import { normalizeData } from "../utils/dataAdapter"

export async function loadDataset(dataset) {

  const res = await fetch(`/${dataset}`)
  const text = await res.text()

  return normalizeData(text)

}