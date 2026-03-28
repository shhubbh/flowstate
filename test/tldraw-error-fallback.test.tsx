import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TldrawErrorFallback } from '../client/components/TldrawErrorFallback'

const mocks = vi.hoisted(() => ({
	resetLegacyTldrawState: vi.fn(() => Promise.resolve()),
}))

vi.mock('../client/lib/resetLegacyTldrawState', () => ({
	resetLegacyTldrawState: mocks.resetLegacyTldrawState,
}))

describe('TldrawErrorFallback', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	it('renders error message and both buttons', () => {
		render(<TldrawErrorFallback error={new Error('Test crash')} />)

		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
		expect(screen.getByText('Test crash')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /reset & reload/i })).toBeInTheDocument()
	})

	it('renders fallback message for non-Error values', () => {
		render(<TldrawErrorFallback error="string error" />)

		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
		expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
	})

	it('Reset & Reload button exists and is distinct from Reload', () => {
		render(<TldrawErrorFallback error={new Error('crash')} />)

		const buttons = screen.getAllByRole('button')
		expect(buttons).toHaveLength(2)
		expect(buttons[0]).toHaveTextContent('Reload')
		expect(buttons[1]).toHaveTextContent('Reset & Reload')
	})

	it('uses the shared legacy reset utility before reloading', () => {
		mocks.resetLegacyTldrawState.mockImplementationOnce(() => new Promise(() => {}))

		render(<TldrawErrorFallback error={new Error('crash')} />)

		fireEvent.click(screen.getByRole('button', { name: /reset & reload/i }))

		expect(mocks.resetLegacyTldrawState).toHaveBeenCalledTimes(1)
	})
})
