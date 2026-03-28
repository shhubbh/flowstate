import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TldrawAgentAppProvider } from '../client/agent/TldrawAgentAppProvider'

const mocks = vi.hoisted(() => {
	const addToast = vi.fn()

	return {
		editor: {},
		addToast,
		toasts: { addToast },
		ensureAtLeastOneAgent: vi.fn(() => ({ id: 'agent-1' })),
		dispose: vi.fn(),
		constructorSpy: vi.fn(),
	}
})

vi.mock('tldraw', () => ({
	useEditor: () => mocks.editor,
	useToasts: () => mocks.toasts,
	useValue: (_name: string, getValue: () => unknown) => getValue(),
}))

vi.mock('../client/agent/TldrawAgentApp', () => ({
	TldrawAgentApp: vi.fn(function MockTldrawAgentApp(this: any, editor: unknown, options: unknown) {
		mocks.constructorSpy(editor, options)
		this.agents = { ensureAtLeastOneAgent: mocks.ensureAtLeastOneAgent }
		this.dispose = mocks.dispose
	}),
}))

describe('TldrawAgentAppProvider', () => {
	afterEach(() => {
		vi.clearAllMocks()
		delete (window as any).agentApp
		delete (window as any).agent
		delete (window as any).editor
	})

	it('boots a fresh agent and renders children without persistence hooks', async () => {
		render(
			<TldrawAgentAppProvider>
				<div>ready</div>
			</TldrawAgentAppProvider>
		)

		await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument())

		expect(mocks.constructorSpy).toHaveBeenCalledWith(
			mocks.editor,
			expect.objectContaining({ onError: expect.any(Function) })
		)
		expect(mocks.ensureAtLeastOneAgent).toHaveBeenCalledTimes(1)
		expect((window as any).agent).toEqual({ id: 'agent-1' })
	})

	it('disposes the app on unmount', async () => {
		const view = render(
			<TldrawAgentAppProvider>
				<div>ready</div>
			</TldrawAgentAppProvider>
		)

		await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument())
		mocks.dispose.mockClear()
		view.unmount()

		expect(mocks.dispose).toHaveBeenCalledTimes(1)
	})
})
