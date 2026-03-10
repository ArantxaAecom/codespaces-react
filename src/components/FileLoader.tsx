import React from "react"
import { Dataset } from "../types"

/**
 * Propiedades del componente FileLoader
 */
interface FileLoaderProps {
  onFileLoad: (dataset: Dataset) => void;
}

/**
 * 
 * @param props - Propiedades del componente   
 * @returns Elemento JSX conel input de archivos
 */
export default function FileLoader({ onFileLoad }: FileLoaderProps): JSX.Element {

  function handleFile(e: React.ChangeEvent<HTMLInputElement>):void {
    const file = e.target.files?.[0];
    if (!file) return
    onFileLoad({
      type: "file",
      file
    })
  }

  return (
    <div>
      <input
        type="file"
        accept=".csv,.json,.geojson"
        onChange={handleFile}
      />
    </div>
  )
}

