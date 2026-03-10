export interface Row {
  id: string | number;
  [key: string]: any; // Permite columnas dinámicas adicionales
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export interface TableInfo {
  name: string;
}

export interface DatasetConfig {
  type: "api" | "file";
  table?: string;
  file?: File;
}

export type Dataset = string | DatasetConfig | null;

export interface GeoTableProps {
  onRowSelect: (row: Row | null) => void;
  selectedFeature?: Row | null;
}
