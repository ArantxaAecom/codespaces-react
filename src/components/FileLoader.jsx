export default function FileLoader({ onFileLoad }) {

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    onFileLoad({
      type: "upload",
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

