import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetLegacyTldrawState } from '../client/lib/resetLegacyTldrawState'

describe('resetLegacyTldrawState', () => {
	afterEach(() => {
		localStorage.clear()
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	it('clears matching localStorage keys', async () => {
		localStorage.setItem('tldraw-agent-app:state', '{"ok":true}')
		localStorage.setItem('TLDRAW_DB_NAME_INDEX_v2', 'index')
		localStorage.setItem('TLDRAW_USER_DATA_v3', 'user')
		localStorage.setItem('unrelated', 'keep')

		vi.stubGlobal('indexedDB', {
			databases: vi.fn().mockResolvedValue([]),
			deleteDatabase: vi.fn(),
		})

		await resetLegacyTldrawState()

		expect(localStorage.getItem('tldraw-agent-app:state')).toBeNull()
		expect(localStorage.getItem('TLDRAW_DB_NAME_INDEX_v2')).toBeNull()
		expect(localStorage.getItem('TLDRAW_USER_DATA_v3')).toBeNull()
		expect(localStorage.getItem('unrelated')).toBe('keep')
	})

	it('tolerates missing indexedDB.databases', async () => {
		vi.stubGlobal('indexedDB', {
			deleteDatabase: vi.fn(),
		})

		await expect(resetLegacyTldrawState()).resolves.toBeUndefined()
	})

	it('handles blocked and erroring deleteDatabase calls without throwing', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const blockedRequest: { onblocked: null | (() => void); onerror: null | (() => void); error: null } =
			{ onblocked: null, onerror: null, error: null }
		const erroredRequest: {
			onblocked: null | (() => void)
			onerror: null | (() => void)
			error: Error
		} = {
			onblocked: null,
			onerror: null,
			error: new Error('boom'),
		}
		const deleteDatabase = vi
			.fn()
			.mockImplementationOnce(() => {
				queueMicrotask(() => blockedRequest.onblocked?.())
				return blockedRequest
			})
			.mockImplementationOnce(() => {
				queueMicrotask(() => erroredRequest.onerror?.())
				return erroredRequest
			})

		vi.stubGlobal('indexedDB', {
			databases: vi.fn().mockResolvedValue([
				{ name: 'TLDRAW_DOCUMENT_v2thinking-map-v2' },
				{ name: 'TLDRAW_DOCUMENT_v3thinking-map-safety' },
			]),
			deleteDatabase,
		})

		await expect(resetLegacyTldrawState()).resolves.toBeUndefined()
		await Promise.resolve()

		expect(deleteDatabase).toHaveBeenCalledTimes(2)
		expect(warnSpy).toHaveBeenCalledTimes(2)
	})
})
