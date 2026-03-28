import type { ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { resetLegacyTldrawState } from './resetLegacyTldrawState'

export interface BootAppDependencies {
	createRoot?: typeof ReactDOM.createRoot
	resetLegacyState?: typeof resetLegacyTldrawState
	scheduleBackgroundTask?: (task: () => void) => void
	warn?: (...args: unknown[]) => void
}

function defaultScheduleBackgroundTask(task: () => void) {
	if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
		window.requestAnimationFrame(() => task())
		return
	}

	setTimeout(task, 0)
}

export function bootApp(
	rootElement: HTMLElement,
	appNode: ReactNode,
	deps: BootAppDependencies = {}
) {
	const createRoot = deps.createRoot ?? ReactDOM.createRoot
	const resetLegacyState = deps.resetLegacyState ?? resetLegacyTldrawState
	const scheduleBackgroundTask = deps.scheduleBackgroundTask ?? defaultScheduleBackgroundTask
	const warn = deps.warn ?? console.warn

	createRoot(rootElement).render(appNode)

	scheduleBackgroundTask(() => {
		void resetLegacyState().catch((error) => {
			warn('Legacy tldraw cleanup failed during startup.', error)
		})
	})
}
