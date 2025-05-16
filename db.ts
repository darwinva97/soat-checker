import { JSONFilePreset } from 'lowdb/node'
import path from 'path'

// Define el tipo para nuestros datos
type Placa = {
  placa: string;
  result?: string;
  error?: string;
  html?: string;
  lastCaptcha?: string;
}

// Define la estructura de la base de datos
type Schema = {
  placas: Placa[];
}

// Crea o carga la base de datos
export const getDB = async () => {
  const dbPath = path.join(__dirname, 'db.json');
  
  const defaultData: Schema = { placas: [] }
  const db = await JSONFilePreset<Schema>(dbPath, defaultData)
  
  return db
}
