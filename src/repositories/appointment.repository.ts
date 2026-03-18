/**
 * Repository layer — pure data access, no business logic.
 * Abstracts IndexedDB operations behind a clean interface.
 */
import { openDB, type IDBPDatabase } from 'idb'
import type { Appointment } from '../types'

const DB_NAME = 'leila-salon'
const DB_VERSION = 1
const STORE_NAME = 'appointments'

let _db: IDBPDatabase | null = null

async function getDatabase(): Promise<IDBPDatabase> {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('clientPhone', 'clientPhone')
        store.createIndex('date', 'date')
        store.createIndex('status', 'status')
      }
    },
  })
  return _db
}

export const appointmentRepository = {
  async findAll(): Promise<Appointment[]> {
    const db = await getDatabase()
    return db.getAll(STORE_NAME)
  },

  async findById(id: string): Promise<Appointment | undefined> {
    const db = await getDatabase()
    return db.get(STORE_NAME, id)
  },

  async findByPhone(phone: string): Promise<Appointment[]> {
    const db = await getDatabase()
    return db.getAllFromIndex(STORE_NAME, 'clientPhone', phone)
  },

  async save(appointment: Appointment): Promise<void> {
    const db = await getDatabase()
    await db.put(STORE_NAME, appointment)
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase()
    await db.delete(STORE_NAME, id)
  },
}
