interface IndexedDbInfo {
	name?: string | null
}

type IndexedDbWithDatabases = IDBFactory & {
	databases?: () => Promise<IndexedDbInfo[]>
}

const AGENT_APP_STORAGE_PREFIX = 'tldraw-agent-app:'
const TLDRAW_DB_NAME_INDEX_KEY = 'TLDRAW_DB_NAME_INDEX_v2'
const TLDRAW_USER_DATA_KEY = 'TLDRAW_USER_DATA_v3'
const LEGACY_DOCUMENT_NAME_PATTERN = /^TLDRAW_DOCUMENT_.*thinking-map/i

function getLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null
	} catch {
		return null
	}
}

function getIndexedDb(): IndexedDbWithDatabases | null {
	try {
		return (globalThis.indexedDB as IndexedDbWithDatabases | undefined) ?? null
	} catch {
		return null
	}
}

function getStorageKeys(storage: Storage) {
	const keys: string[] = []

	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i)
		if (key) {
			keys.push(key)
		}
	}

	return keys
}

function scheduleLegacyDatabaseDelete(indexedDb: IDBFactory, databaseName: string) {
	try {
		const request = indexedDb.deleteDatabase(databaseName)
		request.onblocked = () => {
			console.warn(`Legacy tldraw database delete was blocked: ${databaseName}`)
		}
		request.onerror = () => {
			console.warn(`Failed to delete legacy tldraw database: ${databaseName}`, request.error)
		}
	} catch (error) {
		console.warn(`Failed to delete legacy tldraw database: ${databaseName}`, error)
	}
}

export function clearLegacyTldrawLocalStorage() {
	const storage = getLocalStorage()
	if (!storage) return

	try {
		const keys = getStorageKeys(storage).filter(
			(key) =>
				key.startsWith(AGENT_APP_STORAGE_PREFIX) ||
				key === TLDRAW_DB_NAME_INDEX_KEY ||
				key === TLDRAW_USER_DATA_KEY
		)

		for (const key of keys) {
			storage.removeItem(key)
		}
	} catch {
		// best-effort
	}
}

export async function resetLegacyTldrawState() {
	clearLegacyTldrawLocalStorage()

	const indexedDb = getIndexedDb()
	if (!indexedDb || typeof indexedDb.databases !== 'function') {
		return
	}

	try {
		const databases = await indexedDb.databases()

		for (const database of databases) {
			const name = database?.name
			if (name && LEGACY_DOCUMENT_NAME_PATTERN.test(name)) {
				scheduleLegacyDatabaseDelete(indexedDb, name)
			}
		}
	} catch (error) {
		console.warn('Failed to enumerate legacy tldraw databases.', error)
	}
}
