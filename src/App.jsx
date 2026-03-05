import './App.css';
import { useState } from "react"
import GeoTable from './components/table.jsx';

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null)

  return (
    <div className="App">
      <GeoTable onRowSelect={setSelectedFeature}
        selectedFeature={selectedFeature}
      />
      {/* <MapViewer selectedFeature={selectedFeature} /> 
      
      // para actualizar en el visor GIS
      useEffect(() => {

        if (!selectedFeature) return

        highlightFeature(selectedFeature)

      }, [selectedFeature])
            */}
    </div>
  );
}

export default App;
