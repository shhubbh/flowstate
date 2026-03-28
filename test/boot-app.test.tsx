import { describe, expect, it, vi } from 'vitest'
import { bootApp } from '../client/lib/bootApp'

describe('bootApp', () => {
	it('renders before scheduling background cleanup', () => {
		const appNode = <div>app</div>
		const events: string[] = []
		const render = vi.fn(() => {
			events.push('render')
		})
		const createRoot = vi.fn(() => ({ render }))
		const scheduleBackgroundTask = vi.fn((task: () => void) => {
			events.push('schedule')
			task()
		})
		const resetLegacyState = vi.fn(() => {
			events.push('cleanup')
			return new Promise<void>(() => {})
		})

		bootApp(document.createElement('div'), appNode, {
			createRoot: createRoot as any,
			resetLegacyState,
			scheduleBackgroundTask,
		})

		expect(createRoot).toHaveBeenCalledTimes(1)
		expect(render).toHaveBeenCalledWith(appNode)
		expect(resetLegacyState).toHaveBeenCalledTimes(1)
		expect(events).toEqual(['render', 'schedule', 'cleanup'])
	})

	it('renders even if cleanup never resolves', () => {
		const appNode = <div>app</div>
		const render = vi.fn()
		const createRoot = vi.fn(() => ({ render }))
		const resetLegacyState = vi.fn(() => new Promise<void>(() => {}))

		bootApp(document.createElement('div'), appNode, {
			createRoot: createRoot as any,
			resetLegacyState,
			scheduleBackgroundTask: (task) => task(),
		})

		expect(render).toHaveBeenCalledWith(appNode)
		expect(resetLegacyState).toHaveBeenCalledTimes(1)
	})

	it('logs a warning when background cleanup rejects', async () => {
		const appNode = <div>app</div>
		const warn = vi.fn()
		const render = vi.fn()
		const createRoot = vi.fn(() => ({ render }))
		const resetLegacyState = vi.fn().mockRejectedValue(new Error('cleanup failed'))

		bootApp(document.createElement('div'), appNode, {
			createRoot: createRoot as any,
			resetLegacyState,
			scheduleBackgroundTask: (task) => task(),
			warn,
		})

		await Promise.resolve()
		await Promise.resolve()

		expect(render).toHaveBeenCalledWith(appNode)
		expect(warn).toHaveBeenCalledWith(
			'Legacy tldraw cleanup failed during startup.',
			expect.any(Error)
		)
	})
})
